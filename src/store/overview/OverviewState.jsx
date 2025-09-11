import { useState, useCallback, useMemo, useEffect } from "react";
import OverviewContext from "./overviewContext";
import { subDays, format } from "date-fns";
import { useSearchParams } from "react-router";
import { cachedFetch } from "../../services/cachedFetch";
import { getCache } from "../../services/cacheUtils";

const OverviewState = (props) => {
    const host = "https://react-api-script.onrender.com"

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const [dateRange, setDateRange] = useState([
        {
            startDate: subDays(new Date(), 7),
            endDate: subDays(new Date(), 1),
            key: "selection",
        },
    ]);

    const formatDate = (date) => format(date, "yyyy-MM-dd");

    const [overviewData, setOverviewData] = useState({})
    const [brands, setBrands] = useState({})

    const [campaignName, setCampaignName] = useState("")

    const [overviewLoading, setOverviewLoading] = useState(false);

    const campaignSetter = (value) => {
        setCampaignName(value)
    }

    const fetchAPI = async (endpoint, setLoadingState) => {
        if (!operator) return;
        setLoadingState(true)
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found");
            return;
        }

        const startDate = formatDate(dateRange[0].startDate);
        const endDate = formatDate(dateRange[0].endDate);

        try {
            const url = `${host}/samsonite/${endpoint}?start_date=${startDate}&end_date=${endDate}&platform=${operator}`;
            const cacheKey = `cache:GET:${url}`;

            const cached = getCache(cacheKey);
            if (cached) {
                setLoadingState(false)
                return cached;
            }

            const response = await cachedFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }, { ttlMs: 5 * 60 * 1000, cacheKey });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Failed to fetch ${endpoint} data:`, error.message);
            return null;
        } finally {
            setLoadingState(false)
        }
    };

    const fetchBrandsAPI = async () => {
        if (!operator) return;
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found");
            return;
        }

        try {
            const url = `${host}/app/brand-name?platform=${operator}`;
            const cacheKey = `cache:GET:${url}`;

            const cached = getCache(cacheKey);
            if (cached) {
                return cached;
            }

            const response = await cachedFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }, { ttlMs: 60 * 60 * 1000, cacheKey });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Failed to fetch brand data:`, error.message);
            return null;
        }
    };

    const getBrandsData = useCallback(async () => {
        const data = await fetchBrandsAPI();
        if (data) setBrands(data);
    }, [operator]);

    const getOverviewData = useCallback(async () => {
        const data = await fetchAPI("home", setOverviewLoading);
        if (data) setOverviewData(data);
    }, [dateRange, operator]);

    useEffect(() => {
        setCampaignName("")
    }, [operator])

    const contextValue = useMemo(
        () => ({
            dateRange,
            setDateRange,
            overviewData,
            getOverviewData,
            getBrandsData,
            campaignSetter,
            overviewLoading,
            formatDate,
            brands,
            campaignName
        }),
        [dateRange, overviewData, campaignSetter, overviewLoading, campaignName, brands]
    );

    return (
        <OverviewContext.Provider value={contextValue}>
            {props.children}
        </OverviewContext.Provider>
    )
}

export default OverviewState