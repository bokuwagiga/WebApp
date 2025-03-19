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

    const fetchData = useCallback(async (page = initialPage) => {
        setError(null);

        try {
            console.log(`Fetching data for page ${page} with perPage ${perPage}`);
            const result = await fetchFunction(page, perPage);

            if (result && result.posts) {
                setData(result.posts);
                if (result.pagination) {
                    setPagination({
                        ...result.pagination,
                        page: page
                    });
                }
            } else {
                setData(result || []);
            }
            return result;
        } catch (err) {
            console.error('Error fetching paginated data:', err);
            setError(err.message || 'Failed to load data');
            return null;
        }

    }, [fetchFunction, perPage, initialPage]);

    const handlePageChange = useCallback((newPage) => {
        console.log(`Changing page to ${newPage}`);
        fetchData(newPage);
    }, [fetchData]);

    return {
        data,
        pagination,
        error,
        fetchData,
        handlePageChange
    };
};

export default usePagination;