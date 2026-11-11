import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProperties } from '../services/propertyService';
import useDebounce from './useDebounce';

const FILTER_KEYS = [
  'search',
  'city',
  'minPrice',
  'maxPrice',
  'propertyType',
  'listingType',
  'bedrooms',
  'bathrooms',
  'sort',
  'page',
];

const DEFAULT_FILTERS = {
  search: '',
  city: '',
  minPrice: '',
  maxPrice: '',
  propertyType: '',
  listingType: '',
  bedrooms: '',
  bathrooms: '',
  sort: 'newest',
  page: 1,
};

const getFiltersFromParams = (searchParams) => ({
  ...DEFAULT_FILTERS,
  ...Object.fromEntries(
    FILTER_KEYS
      .filter((key) => searchParams.has(key))
      .map((key) => [
        key,
        key === 'page' ? Math.max(1, Number(searchParams.get(key)) || 1) : searchParams.get(key),
      ])
  ),
});

export const usePropertySearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => getFiltersFromParams(searchParams), [searchParams]);
  const debouncedSearch = useDebounce(filters.search, 400);
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const requestId = useRef(0);

  const setFilters = useCallback((updates) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      const updateEntries = Object.entries(updates);
      const onlyChangesPage = updateEntries.every(([key]) => key === 'page');

      updateEntries.forEach(([key, value]) => {
        if (!FILTER_KEYS.includes(key)) {
          return;
        }
        if (value === undefined || value === null || value === '' || value === 'All') {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(value));
        }
      });

      if (!onlyChangesPage) {
        nextParams.delete('page');
      }

      return nextParams;
    });
  }, [setSearchParams]);

  const setFilter = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const refetch = useCallback(() => {
    setError('');
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    const params = {
      ...filters,
      search: debouncedSearch,
    };

    setLoading(true);
    let correctingPage = false;
    getProperties(params)
      .then((response) => {
        if (currentRequestId !== requestId.current) {
          return;
        }
        if (filters.page > Math.max(response.pagination.totalPages, 1)) {
          correctingPage = true;
          setFilter('page', 1);
          return;
        }
        setProperties(Array.isArray(response.properties) ? response.properties : []);
        setPagination(response.pagination);
        setError('');
        setHasLoaded(true);
      })
      .catch((requestError) => {
        if (currentRequestId !== requestId.current) {
          return;
        }
        setError(requestError.message || 'Failed to load properties');
        setHasLoaded(true);
      })
      .finally(() => {
        if (currentRequestId === requestId.current && !correctingPage) {
          setLoading(false);
        }
      });

    return () => {
      requestId.current += 1;
    };
  }, [filters, debouncedSearch, refreshCount, setFilter]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    properties,
    pagination,
    loading,
    hasLoaded,
    error,
    refetch,
  };
};

export default usePropertySearch;
