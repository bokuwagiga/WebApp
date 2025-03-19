#app.py
import random
from datetime import datetime, timedelta
import jwt
from faker import Faker
from flask import Flask, jsonify, request, make_response, g, Response
from flask.cli import with_appcontext
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, joinedload
from werkzeug.exceptions import BadRequest

fake = Faker()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'de0b321eea674d2692645706a1739ae8'
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
Base = declarative_base()
CORS(app)


class User(Base, db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, db.Sequence('user_id_seq'), primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    last_updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    posts = db.relationship('Post', backref='user', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='user', lazy=True, cascade='all, delete-orphan', )

    def json(self, exclude_keys=None):
        if exclude_keys is None:
            exclude_keys = []
        return {
            key: value
            for key, value in {
                'user_id': self.user_id,
                'username': self.username,
                'is_admin': self.is_admin,
                'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            }.items()
            if key not in exclude_keys
        }

    @classmethod
    def check_table_exist(cls):
        inspector = inspect(db.engine)
        user_table_exists = 'users' in inspector.get_table_names()
        return user_table_exists


class Post(Base, db.Model):
    __tablename__ = 'posts'

    post_id = db.Column(db.Integer, db.Sequence('post_id_seq'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    post_content = db.Column(db.Text, nullable=False)
    last_updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def json(self, exclude_keys=None):
        if exclude_keys is None:
            exclude_keys = []

        return {
            key: value
            for key, value in {
                'post_id': self.post_id,
                'user_id': self.user_id,
                'post_content': self.post_content,
                'user': self.user.username,
                'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            }.items()
            if key not in exclude_keys
        }

    def all_json(self, exclude_keys=None):
        if exclude_keys is None:
            exclude_keys = []

        post_json = {
            key: value
            for key, value in {
                'post_id': self.post_id,
                'user_id': self.user_id,
                'post_content': self.post_content,
                'user': self.user.username,
                'last_updated': self.last_updated.isoformat() if self.last_updated else None,
                'comments': [comment.json(['comment_id', 'post_id', 'user_id']) for comment in self.comments]
            }.items()
            if key not in exclude_keys
        }

        return post_json

    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan', )


class Comment(Base, db.Model):
    __tablename__ = 'comments'

    comment_id = db.Column(db.Integer, db.Sequence('comment_id_seq'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.post_id'), nullable=False)
    comment_content = db.Column(db.Text, nullable=False)
    last_updated = db.Column(db.DateTime, default=func.now(), onupdate=func.now())

    def json(self, exclude_keys=None):
        if exclude_keys is None:
            exclude_keys = []

        return {
            key: value
            for key, value in {
                'comment_id': self.comment_id,
                'post_id': self.post_id,
                'user_id': self.user_id,
                'user': self.user.username,
                'comment_content': self.comment_content,
                'last_updated': self.last_updated.isoformat() if self.last_updated else None
            }.items()
            if key not in exclude_keys
        }


def get_resource_by_id(resource_model, resource_id, resource_name):
    resource = db.session.get(resource_model, resource_id)
    if resource:
        return resource
    else:
        return jsonify({"error": "Not Found", "message": f"{resource_name} not found with ID: {resource_id}"}), 404


# Error Handling
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Not Found", "message": str(error)}), 404


# Data Validation
def validate_json(required_fields, request_data):
    for field in required_fields:
        if field not in request_data:
            return jsonify({"error": "Not Found", "message": f"Missing required field: {field}"}), 400


def check_token():
    if request.path not in ['/', '/login', '/register'] and not request.path.startswith('/static'):
        token = request.headers.get('Authorization')
        if not token:
            if (request.path.startswith('/posts') or request.path.startswith('/comments')) and request.method == 'GET':
                return
            return jsonify({'message': 'Token is missing'}), 403
        token = token.split("Bearer ")[1] if "Bearer " in token else token
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user = User.query.filter_by(username=data['user']).first()
            if user:
                g.user = user
                return
            else:
                return jsonify({'message': 'User not found'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 403


@app.before_request
def basic_authentication():
    if request.method.lower() == 'options':
        return Response()


@app.before_request
def before_request():
    return check_token()


# API methods for authentication and authorization
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        validate_json(['username', 'password', 'repeat_password'], data)

        user_table_exists = User.check_table_exist()

        if not user_table_exists:
            with app.app_context():
                db.create_all()
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400
        if data['password'] != data['repeat_password']:
            return jsonify({'message': "Passwords don't match"}), 401

        users = User.query.first()
        is_admin = users is None
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(username=data['username'], password=hashed_password, is_admin=is_admin)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400
    except SQLAlchemyError as e:
        return jsonify({"error": "Database Error", "message": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        user_table_exists = User.check_table_exist()

        if not user_table_exists:
            with app.app_context():
                db.create_all()

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            token = jwt.encode({'user_id': user.user_id, 'is_admin': user.is_admin, 'user': user.username,
                                'exp': func.now()() + timedelta(minutes=30)},
                               app.config['SECRET_KEY'])
            response = make_response(jsonify({'token': token}))
            response.set_cookie('token', token, httponly=True)
            return response

        else:
            return make_response(jsonify({'message': "Invalid Login Credentials"}), 401,
                                 {'WWW-Authenticate': 'Basic realm="Login Required"'})
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


# CRUD methods for users
@app.route('/users', methods=['GET'])
def get_users():
    sort_by = request.args.get('sort_by', 'post_id')
    order = request.args.get('order', 'desc')
    if sort_by == 'username':
        sort_column = User.usename
    else:
        sort_column = User.last_updated

    if order.lower() == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()
    users = User.query.order_by(sort_column).all()
    if hasattr(g, 'user') and g.user.is_admin:
        users_list = [user.json() for user in users]
    else:
        users_list = [user.json(['is_admin']) for user in users]
    return jsonify(users_list)


@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = get_resource_by_id(resource_model=User, resource_id=user_id, resource_name='User')
    if isinstance(user, tuple):
        return user
    if hasattr(g, 'user') and g.user.is_admin:
        user_data = user.json()
    else:
        user_data = {"user_id": user.user_id, "username": user.username}
    return jsonify(user_data)


@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        validate_json(['username', 'password'], data)

        if not g.user or not getattr(g.user, 'is_admin', False):
            return jsonify({'message': 'Unauthorized. Only admins can create users.'}), 401

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400

        user = User(username=data['username'], password=hashed_password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = get_resource_by_id(resource_model=User, resource_id=user_id, resource_name='User')
        if isinstance(user, tuple):
            return user
        if not g.user or (not g.user.is_admin and g.user.user_id != user.user_id):
            return jsonify({'message': 'Unauthorized. Only admins or the user can update this user.'}), 401

        data = request.get_json()
        validate_json(['username', 'password'], data)
        password = user.password

        if data['new_password'] and data['repeat_new_password'] and data['new_password'] != '' \
                and data['repeat_new_password'] != '':
            if data['new_password'] != data['repeat_new_password']:
                return jsonify({'message': "New passwords don't match"}), 400
            else:
                password = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')

        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            if existing_user.user_id != user.user_id:
                return jsonify({'message': 'Username already exists'}), 400
        if not bcrypt.check_password_hash(user.password, data['password']) and not g.user.is_admin:
            return jsonify({'message': 'Current password is incorrect'}), 401

        user.username = data['username']
        user.password = password

        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = get_resource_by_id(resource_model=User, resource_id=user_id, resource_name='User')
        if isinstance(user, tuple):
            return user
        if not g.user or (not g.user.is_admin and g.user.user_id != user.user_id):
            return jsonify({'message': 'Unauthorized. Only admins or the user can delete this user.'}), 401
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted"})
    except ValueError as e:
        return jsonify({"error": e.args[0], "message": f"No user found with ID {user_id}"}), 404


# CRUD methods for Posts
@app.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'post_id')
    order = request.args.get('order', 'desc')

    total_posts = Post.query.count()

    if sort_by == 'last_updated':
        sort_column = Post.last_updated
    else:
        sort_column = Post.post_id

    if order.lower() == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    paginated_posts = (
        Post.query.options(joinedload(Post.user))
        .order_by(sort_column)
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    post_list = [post.json() for post in paginated_posts.items]

    pagination = {
        'total': total_posts,
        'pages': paginated_posts.pages,
        'page': page,
        'per_page': per_page,
        'has_next': paginated_posts.has_next,
        'has_prev': paginated_posts.has_prev
    }

    return jsonify({
        'posts': post_list,
        'pagination': pagination
    })

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = get_resource_by_id(resource_model=Post, resource_id=post_id, resource_name='Post')
    if isinstance(post, tuple):
        return post
    else:
        return post.json()


@app.route('/posts', methods=['POST'])
def create_post():
    try:
        data = request.get_json()
        validate_json(['post_content'], data)
        post = Post(user_id=g.user.user_id, post_content=data['post_content'])
        db.session.add(post)
        db.session.commit()
        return jsonify({'message': 'Post created successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    try:
        post = get_resource_by_id(resource_model=Post, resource_id=post_id, resource_name='Post')
        if isinstance(post, tuple):
            return post
        if not g.user or (not g.user.is_admin and g.user.user_id != post.user_id):
            return jsonify({'message': 'Unauthorized. Only the user who created the post can update it.'}), 401

        data = request.get_json()
        validate_json(['post_content'], data)
        post.post_content = data['post_content']
        db.session.commit()
        return jsonify({'message': 'Post updated successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        post = get_resource_by_id(resource_model=Post, resource_id=post_id, resource_name="Post")
        if isinstance(post, tuple):
            return post
        if not g.user or (g.user.user_id != post.user_id and not g.user.is_admin):
            return jsonify(
                {'message': 'Unauthorized. Only admins or the user who created the post can delete it.'}), 401
        db.session.delete(post)
        db.session.commit()
        return jsonify({"message": "Post deleted"})
    except ValueError as e:
        return jsonify({"error": e.args[0], "message": f"No post found with ID {post_id}"}), 404


# CRUD methods for Comments
@app.route('/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    try:
        data = request.get_json()
        validate_json(['comment_content'], data)
        comment = Comment(user_id=g.user.user_id, post_id=post_id, comment_content=data['comment_content'])
        db.session.add(comment)
        db.session.commit()
        return jsonify({'message': 'Comment created successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = get_resource_by_id(resource_model=Post, resource_id=post_id, resource_name='Post')
    if isinstance(post, tuple):
        return post

    sort_by = request.args.get('sort_by', 'comment_id')
    order = request.args.get('order', 'desc')

    if sort_by == 'last_updated':
        sort_column = Comment.last_updated
    else:
        sort_column = Comment.comment_id

    if order.lower() == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    comments = (
        Comment.query.options(joinedload(Comment.post).joinedload(Post.user))
        .filter_by(post_id=post_id)
        .order_by(sort_column)
        .all()
    )
    comment_list = post.json()
    comment_list['comments'] = [comment.json() for comment in comments]

    return jsonify(comment_list)


@app.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment_by_id(comment_id):
    comment = get_resource_by_id(resource_model=Comment, resource_id=comment_id, resource_name='Comment')
    if isinstance(comment, tuple):
        return comment
    else:
        return jsonify(comment.json())


@app.route('/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    try:
        comment = get_resource_by_id(resource_model=Comment, resource_id=comment_id, resource_name='Comment')
        if isinstance(comment, tuple):
            return comment
        if not g.user or (g.user.user_id != comment.user_id and not g.user.is_admin):
            return jsonify(
                {'message': 'Unauthorized. Only admins or the user who created the comment can update it.'}), 401
        data = request.get_json()
        validate_json(['comment_content'], data)
        comment.comment_content = data['comment_content']
        db.session.commit()
        return jsonify({'message': 'Comment updated successfully'}), 201
    except BadRequest as e:
        return jsonify({"error": "Bad Request", "message": e.description}), 400
    except KeyError as e:
        return jsonify({"error": "Bad Request", "message": f"Missing required field: {e.args[0]}"}), 400


@app.route('/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    try:
        comment = get_resource_by_id(resource_model=Comment, resource_id=comment_id, resource_name='Comment')
        if isinstance(comment, tuple):
            return comment
        if not g.user or (g.user.user_id != comment.user_id and not g.user.is_admin):
            return jsonify(
                {'message': 'Unauthorized. Only admins or the user who created the comment can delete it.'}), 401
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"message": "Comment deleted"})
    except ValueError as e:
        return jsonify({"error": e.args[0], "message": f"No comment found with ID {comment_id}"}), 404


@app.route('/users/<int:user_id>/posts', methods=['GET'])
def get_posts_by_user_id(user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'post_id')
    order = request.args.get('order', 'desc')

    user = get_resource_by_id(resource_model=User, resource_id=user_id, resource_name='User')
    if isinstance(user, tuple):
        return user

    if sort_by == 'last_updated':
        sort_column = Post.last_updated
    else:
        sort_column = Post.post_id

    if order.lower() == 'asc':
        sort_column = sort_column.asc()
    else:
        sort_column = sort_column.desc()

    query = Post.query.filter_by(user_id=user.user_id).order_by(sort_column)
    total_posts = query.count()
    paginated_posts = query.paginate(page=page, per_page=per_page, error_out=False)
    user_posts = [post.all_json() for post in paginated_posts.items]
    pagination = {
        'total': total_posts,
        'pages': paginated_posts.pages,
        'page': page,
        'per_page': per_page,
        'has_next': paginated_posts.has_next,
        'has_prev': paginated_posts.has_prev
    }
    if user_posts:
        return jsonify({
            'posts': user_posts,
            'pagination': pagination
        })
    else:
        return jsonify({"message": f"No posts found for user with ID {user_id}"}), 404


@app.cli.command("populate_db")
@with_appcontext
def populate_db():
    # Create 10 random users
    for _ in range(10):
        username = fake.user_name()
        password = fake.password()
        user = User(username=username, password=password)
        db.session.add(user)

    db.session.commit()

    users = User.query.all()
    for user in users:
        for _ in range(random.randint(1, 5)):
            post_content = fake.text(max_nb_chars=200)
            post = Post(user_id=user.user_id, post_content=post_content)
            db.session.add(post)

    db.session.commit()

    posts = Post.query.all()
    for post in posts:
        for _ in range(random.randint(1, 5)):
            user = random.choice(users)
            comment_content = fake.text(max_nb_chars=100)
            comment = Comment(user_id=user.user_id, post_id=post.post_id, comment_content=comment_content)
            db.session.add(comment)

    db.session.commit()

    print("Database populated with random users, posts, and comments.")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)