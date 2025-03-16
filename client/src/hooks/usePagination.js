// src/hooks/usePagination.js
import {useState, useCallback} from 'react';

const usePagination = (fetchFunction, initialPage = 1, perPage = 10) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        page: initialPage,
        per_page: perPage,
        total: 0,
        pages: 0,
        has_next: false,
        has_prev: false
    });
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (page = pagination.page) => {
        setError(null);

        try {
            const result = await fetchFunction(page, pagination.per_page);

            if (result && result.posts) {
                setData(result.posts);
                setPagination(result.pagination);
            } else {
                setData(result || []);
            }
        } catch (err) {
            console.error('Error fetching paginated data:', err);
            setError(err.message || 'Failed to load data');
        }
    }, [fetchFunction, pagination.page, pagination.per_page]);

    const handlePageChange = (newPage) => {
        fetchData(newPage);
    };

    return {
        data,
        pagination,
        error,
        fetchData,
        handlePageChange
    };
};

export default usePagination;