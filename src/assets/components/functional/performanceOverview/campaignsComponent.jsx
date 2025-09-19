import React, { useContext, useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import MuiDataTableComponent from "../../common/muidatatableComponent";
import '../../../styles/campaignsComponent/campaignsComponent.less';
import overviewContext from "../../../../store/overview/overviewContext";
import { Switch, Box, Button, Snackbar, Alert } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress } from "@mui/material";
import { useSearchParams } from "react-router";
import ColumnPercentageDataComponent from "../../common/columnPercentageDataComponent";
import TrendsModal from "./modal/trendsModal";
import BudgetCell from "./overview/budgetCell";
import NewPercentageDataComponent from "../../common/newPercentageDataComponent";
import { cachedFetch } from "../../../../services/cachedFetch";
import { getCache, setCache } from "../../../../services/cacheUtils";
import OnePercentageDataComponent from "../../common/onePercentageComponent";
import ValueFormatter from "../../common/valueFormatter";

const CampaignsComponent = (props, ref) => {

    const dataContext = useContext(overviewContext)
    const { dateRange, brands, getBrandsData, formatDate } = dataContext

    const [updatingCampaigns, setUpdatingCampaigns] = useState({});
    const [showTrendsModal, setShowTrendsModal] = useState({ name: '', show: false, date: [] })
    const [campaignsData, setCampaignsData] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [confirmation, setConfirmation] = useState({ 
        show: false, 
        campaignId: null, 
        campaignType: null,
        adType: null 
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const STATUS_OPTIONS = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Paused' }
    ]

    const CampaignsColumnFlipkart = [
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 200,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        cursor: "pointer"
                    }}
                    onClick={() => handleCampaignClick(params.row.campaign_name, params.row.campaign_id)}
                    className="redirect"
                >
                    {params.row.campaign_name}
                </Box>
            ),
        },
        {
            field: "Budget",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell status={params.row.campaign_status} value={params.row.Budget} campaignId={params.row.campaign_id} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_id === campaignId
                                    ? { ...campaign, Budget: newBudget }
                                    : campaign
                            )
                        };
                        console.log("Updated campaignsData:", updatedData);
                        return updatedData;
                    });
                }} onSnackbarOpen={handleSnackbarOpen} />,
            headerAlign: "left",
            type: "number", align: "left",
        },
        {
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                const status = params.row.status;

                if (updatingCampaigns[params.row.campaign_id]) {
                    return (
                        <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <CircularProgress size={24} />
                        </Box>
                    );
                }

                const isActive = status === 1 || status === "1";

                return (
                    <Switch
                        checked={isActive}
                        onChange={() => handleToggle(
                            params.row.campaign_id,
                            isActive ? 0 : 1,  // New status to be set
                            params.row.ad_type  // Pass ad_type from row data
                        )}
                    />
                );
            },
            type: "singleSelect",
            valueOptions: [
                { value: 1, label: "Active" },
                { value: 0, label: "Paused" }
            ]
        },
        {
            field: "ad_type",
            headerName: "CAMPAIGN TYPE",
            minWidth: 155,
        },
        {
            field: "views_y",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.views_y} percentValue={params.row.views_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "clicks_y",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks_y} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cost_y",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cost_y} percentValue={params.row.cost_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "total_converted_units_y",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.total_converted_units_y} percentValue={params.row.total_converted_units_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "total_converted_revenue_y",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.total_converted_revenue_y} percentValue={params.row.total_converted_revenue_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ctr_y",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ctr_y} percentValue={params.row.ctr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cvr",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cvr} percentValue={params.row.cvr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "cpc",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpc} percentValue={params.row.cpc_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "roi_y",
            headerName: "ROI",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi_y} percentValue={params.row.roi_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "acos",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.acos} percentValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "aov",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov} percentValue={params.row.aov_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        }
    ];

    const getCampaignsData = async (forceRefresh = false) => {
        if (!operator) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setCampaignsData({});
        setIsLoading(true);

        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No access token found");
            setIsLoading(false);
            return;
        }

        const startDate = formatDate(dateRange[0].startDate);
        const endDate = formatDate(dateRange[0].endDate);

        try {
            const ts = forceRefresh ? `&_=${Date.now()}` : "";
            const url = `https://react-api-script.onrender.com/samsonite/campaign?start_date=${startDate}&end_date=${endDate}&platform=${operator}${ts}`;
            const cacheKey = `cache:GET:${url}`;

            if (forceRefresh) {
                try { localStorage.removeItem(cacheKey); } catch (_) {}
            } else {
                const cached = getCache(cacheKey);
                if (cached) {
                    setCampaignsData(cached);
                    setIsLoading(false);
                    return;
                }
            }

            const response = await cachedFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            }, { ttlMs: 5 * 60 * 1000, cacheKey, bypassCache: forceRefresh });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCampaignsData(data);
            if (forceRefresh) {
                try { setCache(cacheKey, data, 5 * 60 * 1000); } catch (_) {}
            }
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Previous request aborted due to operator change.");
            } else {
                console.error("Failed to fetch campaigns data:", error.message);
                setCampaignsData({});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        console.log("Refresh clicked: forcing network fetch");
        getCampaignsData(true);
    };

    useImperativeHandle(ref, () => ({
        refresh: handleRefresh
    }));

    const abortControllerRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            getCampaignsData();
        }, 100);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearTimeout(timeout);
        }
    }, [operator, dateRange]);

    const columns = useMemo(() => {
        if (operator === "Amazon") return CampaignsColumnAmazon;
        if (operator === "Zepto") return CampaignsColumnZepto;
        if (operator === "Flipkart") return CampaignsColumnFlipkart;
        if (operator === "Swiggy") return CampaignsColumnSwiggy;
       
        return [];
    }, [operator, brands, updatingCampaigns]);

    const handleCampaignClick = async (campaignName, campaignId) => {
        try {
            const token = localStorage.getItem("accessToken");
            const startDate = formatDate(dateRange[0].startDate);
            const endDate = formatDate(dateRange[0].endDate);
            const url = `https://react-api-script.onrender.com/samsonite/campaign_graph?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&platform=${operator}&campaign_id=${campaignId}`;
            const cacheKey = `cache:GET:${url}`;

            const cached = getCache(cacheKey);
            if (cached) {
                setShowTrendsModal({ name: campaignName, show: true, data: cached });
                return;
            }

            const response = await cachedFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }, { ttlMs: 5 * 60 * 1000, cacheKey });
            const data = await response.json()
            if (response.ok) {
                setShowTrendsModal({ name: campaignName, show: true, data: data });
            } else {
                console.error("Failed to fetch campaign data");
            }
        } catch (error) {
            console.error("Error fetching campaign data", error);
        }
    };

    const handleToggle = (campaignId, newStatus, adType) => {
        // Show confirmation dialog with the new status that will be set
        setConfirmation({ 
            show: true, 
            campaignId, 
            campaignType: newStatus, // This will be the new status (0 or 1)
            adType // Add adType to confirmation state
        });
    };

    const updateCampaignStatus = (campaignId, newStatus, adType) => {
        setConfirmation({ show: false, campaignId: null, campaignType: null, adType: null });
        setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: true }));
        confirmStatusChange(campaignId, newStatus, adType);
    };

    const confirmStatusChange = async (campaignId, newStatus, adType) => {
        try {
            const token = localStorage.getItem("accessToken");
            
            const requestBody = {
                campaign_id: campaignId,
                ad_type: adType
            };

            const response = await fetch(`https://react-api-script.onrender.com/samsonite/campaign-play-pause?platform=${operator}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error("Failed to update campaign status");

            const data = await response.json();
            console.log("Campaign status updated successfully", data);

            // Update the local state to reflect the new status
            setCampaignsData(prevData => ({
                ...prevData,
                data: prevData.data.map(campaign =>
                    campaign.campaign_id === campaignId
                        ? { ...campaign, status: newStatus }
                        : campaign
                )
            }));

            setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: false }));
            handleSnackbarOpen("Campaign status updated successfully!", "success");
            
        } catch (error) {
            console.error("Error updating campaign status:", error);
            handleSnackbarOpen("Error updating campaign status", "error");
            setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: false }));
            
            // Optionally refresh data on error to sync with server state
            getCampaignsData();
        }
    };

    const handleSnackbarOpen = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <React.Fragment>
            <Dialog open={confirmation.show} onClose={() => setConfirmation({ show: false, campaignId: null, campaignType: null, adType: null })}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    Are you sure you want to {confirmation.campaignType === 1 ? 'activate' : 'pause'} this campaign?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmation({ show: false, campaignId: null, campaignType: null, adType: null })}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => updateCampaignStatus(confirmation.campaignId, confirmation.campaignType, confirmation.adType)} 
                        color="primary"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            <TrendsModal
                showTrendsModal={showTrendsModal}
                setShowTrendsModal={setShowTrendsModal} />
            <div className="shadow-box-con-campaigns aggregated-view-con">
                <div className="datatable-con-campaigns">
                    <MuiDataTableComponent
                        isLoading={isLoading}
                        isExport={true}
                        columns={columns}
                        data={campaignsData.data || []} />
                </div>
            </div>
            <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}

export default forwardRef(CampaignsComponent);