/**
 * useUrlFilters Hook - Persist filters in URL query params
 * 
 * Features:
 * - Sync filter state with URL search params
    *   - Deep linking support
    *   - Browser history integration
    *   - Type-safe filter values
    */
    
    import { useState, useEffect, useCallback } from "react";
    import { useSearchParams } from "react-router";
    
    type FilterValue = string | string[] | number | boolean | null | undefined;
    
    interface FilterConfig {
    key: string;
    defaultValue?: FilterValue;
    serialize?: (value: FilterValue) => string;
    deserialize?: (value: string) => FilterValue;
    }
    
    export function useUrlFilters<T extends Record<string, FilterConfig>>(
    filtersConfig: T
    ) {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Initialize filter values from URL or defaults
    const getInitialValues = useCallback(() => {
        const values: Record<string, FilterValue> = {};
        
        Object.entries(filtersConfig).forEach(([key, config]) => {
        const urlValue = searchParams.get(config.key);
        if (urlValue !== null) {
            values[key] = config.deserialize 
            ? config.deserialize(urlValue)
            : urlValue;
        } else {
            values[key] = config.defaultValue;
        }
        });
        
        return values;
    }, [searchParams]);
    
    const [filters, setFilters] = useState<Record<string, FilterValue>>(getInitialValues);
    
    // Update URL when filters change
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        let hasChanges = false;
        
        Object.entries(filters).forEach(([key, value]) => {
        const config = filtersConfig[key];
        const serializedValue = config.serialize 
            ? config.serialize(value)
            : value?.toString();
        
        const currentValue = newParams.get(config.key);
        
        if (serializedValue && serializedValue !== config.defaultValue?.toString()) {
            if (currentValue !== serializedValue) {
            newParams.set(config.key, serializedValue);
            hasChanges = true;
            }
        } else {
            if (currentValue !== null) {
            newParams.delete(config.key);
            hasChanges = true;
            }
        }
        });
        
        if (hasChanges) {
        setSearchParams(newParams, { replace: true });
        }
    }, [filters, filtersConfig, searchParams, setSearchParams]);
    
    // Update filter value
    const setFilter = useCallback((key: string, value: FilterValue) => {
        setFilters((prev) => ({
        ...prev,
        [key]: value,
        }));
    }, []);
    
    // Clear all filters
    const clearFilters = useCallback(() => {
        const defaultValues: Record<string, FilterValue> = {};
        Object.entries(filtersConfig).forEach(([key, config]) => {
        defaultValues[key] = config.defaultValue;
        });
        setFilters(defaultValues);
    }, [filtersConfig]);
    
    // Clear specific filter
    const clearFilter = useCallback((key: string) => {
        const config = filtersConfig[key];
        setFilters((prev) => ({
        ...prev,
        [key]: config.defaultValue,
        }));
    }, [filtersConfig]);
    
    // Check if any filter is active
    const hasActiveFilters = useCallback(() => {
        return Object.entries(filters).some(([key, value]) => {
        const config = filtersConfig[key];
        return value !== config.defaultValue;
        });
    }, [filters, filtersConfig]);
    
    return {
        filters,
        setFilter,
        clearFilters,
        clearFilter,
        hasActiveFilters: hasActiveFilters(),
    };
    }
    
    // Preset configurations for common filter types
    export const filterPresets = {
    string: (key: string, defaultValue = ""): FilterConfig => ({
        key,
        defaultValue,
    }),
    
    array: (key: string, defaultValue: string[] = []): FilterConfig => ({
        key,
        defaultValue,
        serialize: (value) => Array.isArray(value) ? value.join(",") : "",
        deserialize: (value) => value ? value.split(",") : [],
    }),
    
    number: (key: string, defaultValue?: number): FilterConfig => ({
        key,
        defaultValue,
        serialize: (value) => value?.toString() || "",
        deserialize: (value) => value ? parseFloat(value) : undefined,
    }),
    
    boolean: (key: string, defaultValue = false): FilterConfig => ({
        key,
        defaultValue,
        serialize: (value) => value ? "true" : "",
        deserialize: (value) => value === "true",
    }),
    };
