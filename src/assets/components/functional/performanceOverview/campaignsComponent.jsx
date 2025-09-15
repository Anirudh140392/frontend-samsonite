import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
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
import { getCache } from "../../../../services/cacheUtils";
import OnePercentageDataComponent from "../../common/onePercentageComponent";
import ValueFormatter from "../../common/valueFormatter";

const CampaignsComponent = () => {

    const dataContext = useContext(overviewContext)
    const { dateRange, brands, getBrandsData, formatDate } = dataContext

    const [updatingCampaigns, setUpdatingCampaigns] = useState({});
    const [showTrendsModal, setShowTrendsModal] = useState({ name: '', show: false, date: [] })
    const [campaignsData, setCampaignsData] = useState({})
    // const { dateRange, brands, getBrandsData, formatDate } = dataContext
    const [isLoading, setIsLoading] = useState(false)
    const [confirmation, setConfirmation] = useState({ show: false, campaignId: null, campaignType: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [searchParams] = useSearchParams();
    const operator = searchParams.get("operator");

    const STATUS_OPTIONS = [
        { value: 1, label: 'Active' },
        { value: 0, label: 'Paused' }
    ]





    const CampaignsColumnAmazon = [
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
            field: "budget_inr_x",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell value={params.row.budget_inr_x} campaignId={params.row.campaign_id} platform={operator} campaignName={params.row.campaign_name} campaignType={params.row.campaign_type}
                onUpdate={(
                    campaignId,
                    campaignName,
                    campaignType,
                    newBudget
                ) => {
                    console.log('Updating campaign:', {
                        campaignId,
                        campaignName,
                        campaignType,
                        newBudget,
                    });

                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_id === campaignId
                                    ? { ...campaign, budget_inr_x: newBudget }
                                    : campaign
                            ),
                        };

                        console.log('Updated campaignsData:', updatedData);
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
            renderCell: (params) => {
                if (updatingCampaigns[params.row.campaign_id] && updatingCampaigns[params.row.campaign_type]) {
                    return <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress size={24} /></Box>;
                }
                return (
                    <Switch
                        disabled={params.row.status === 2}
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.campaign_type)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },
        {
            field: "campaign_type",
            headerName: "AD TYPE",
            minWidth: 100,
        },
        {
            field: "spend_inr_x",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend_inr_x} percentValue={params.row.spend_inr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "spend_inr_diff",
            headerName: "SPENDS % CHANGE",
            hideable: false
        },
        {
            field: "sales_inr_x",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales_inr_x} percentValue={params.row.sales_inr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "sales_inr_diff",
            headerName: "SALES % CHANGE",
            hideable: false
        },
       
       
        {
            field: "impressions_x",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions_x} percentValue={params.row.impressions_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "impressions_diff",
            headerName: "IMPRESSIONS % CHANGE",
            hideable: false
        },
        {
            field: "clicks_x",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks_x} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "clicks_diff",
            headerName: "CLICKS % CHANGE",
            hideable: false
        },
        {
            field: "orders_x",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.orders_x} percentValue={params.row.orders_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "orders_diff",
            headerName: "ORDERS % CHANGE",
            hideable: false
        },
         {
            field: "ctr_x",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.ctr_x} secValue={params.row.ctr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "cpc_x",
            headerName: "CPC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpc_x} percentValue={params.row.cpc_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "cvr_x",
            headerName: "CVR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.cvr_x} secValue={params.row.cvr_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "roas_x",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas_x} percentValue={params.row.roas_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "roas_diff",
            headerName: "ROAS % CHANGE",
            hideable: false
        },
        {
            field: "acos_x",
            headerName: "ACOS",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.acos_x} secValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "aov_x",
            headerName: "AOV",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.aov_x} percentValue={params.row.aov_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        }
    ];

     

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
                    onClick={() => handleCampaignClick(params.row.campaign_name, params.row.campaign_ID)}
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
            renderCell: (params) => <BudgetCell status={params.row.campaign_status} value={params.row.Budget} campaignId={params.row.Campaign_ID} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_ID === campaignId
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
    field: "campaign_status",
    headerName: "STATUS",
    minWidth: 100,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
        const status = params.row.campaign_status;

        if (updatingCampaigns[params.row.campaign_ID]) {
            return (
                <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CircularProgress size={24} />
                </Box>
            );
        }

        const isLive = status === "Live";
        const isAborted = status === "Total Budget Met";

         return (
            <Switch
                checked={isLive}
                disabled={isAborted}
                onChange={() => handleToggle(
                    params.row.campaign_ID,
                    isLive ? "Live" : "Total Budget Met",  // current status, can be used if needed
                    params.row.id
                )}
            />
        );
    },
    type: "singleSelect",
    valueOptions: [
        { value: "LIVE", label: "Live" },
        { value: "PAUSED", label: "Paused" },
        { value: "ABORTED", label: "Aborted" }
    ]
},

        {
            field: "Campaign_Type",
            headerName: "CAMPAIGN TYPE",
            minWidth: 155,
        },
       
        {
            field: "views_x",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.views_x} percentValue={params.row.views_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       
        {
            field: "clicks_x",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks_x} percentValue={params.row.clicks_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ad_spend_x",
            headerName: "SPENDS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ad_spend_x} percentValue={params.row.ad_spend_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
    
        {
            field: "total_units_sold_x",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.total_units_sold_x} percentValue={params.row.total_units_sold_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
       
        
        {
            field: "total_revenue_x",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.total_revenue_x} percentValue={params.row.total_revenue_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "ctr_x",
            headerName: "CTR",
            minWidth: 100,
            renderCell: (params) => (
                <OnePercentageDataComponent firstValue={params.row.ctr_x}  />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "cvr_x",
            headerName: "CVR",
            minWidth: 100,
            renderCell: (params) => (
                <OnePercentageDataComponent firstValue={params.row.cvr_x}  />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
        
{
  field: "roi_x",
  headerName: "ROI",
  minWidth: 150,
   renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi_x} percentValue={params.row.roi_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
  
},
{
  field: "roas_x",
  headerName: "ROAS",
  minWidth: 150,
 renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas_x} percentValue={params.row.roas_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
},
{
  field: "acos_x",
  headerName: "ACOS",
  minWidth: 150,
 renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.acos_x} percentValue={params.row.acos_diff} />
            ), type: "number", align: "left",
            headerAlign: "left",
}  
   ];


    const CampaignsColumnSwiggy = [
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
            field: "budget",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell value={params.row.budget} campaignId={params.row.campaign_id} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.campaign_id === campaignId
                                    ? { ...campaign, daily_budget: newBudget }
                                    : campaign
                            )
                        };
                        console.log("Updated campaignsData:", updatedData);
                        return updatedData;
                    });
                }} onSnackbarOpen={handleSnackbarOpen} />, type: "number", align: "left",
            headerAlign: "left",
        },
        /*{
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                if (updatingCampaigns[params.row.campaign_id]) {
                    return <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress size={24} /></Box>;
                }
                return (
                    <Switch
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.status === 1 ? 1 : 0, params.row.brand_id)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },*/
        
        //{ field: "brand_name", headerName: "BRAND", minWidth: 150, type: "singleSelect", valueOptions: brands?.brands },
        {
            field: "spend",
            headerName: "SPENDS",
            minWidth: 170,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend} percentValue={params.row.spend_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales} percentValue={params.row.sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions} percentValue={params.row.impressions_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "a2c",
            headerName: "ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.a2c} percentValue={params.row.a2c_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "a2c_rate",
            headerName: "ATC RATE",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.a2c_rate} percentValue={params.row.a2c_rate_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        /*{
            field: "atc",
            headerName: " ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        

        {
            field: "ctr",
            headerName: "CTR",
            minWidth: 150,
            renderCell: (params) => (
                <NewPercentageDataComponent firstValue={params.row.ctr} secValue={params.row.ctr_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
         {
            field: "ecpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.ecpm} percentValue={params.row._change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "roi",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roi} percentValue={params.row.roi_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

    ];

    const CampaignsColumnZepto = [
        {
            field: "campaign_name",
            headerName: "CAMPAIGN",
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ cursor: "pointer" }}>
                        {params.row.campaign_name}
                    </Box>
                </Box>
            ),
        },
        {
            field: "daily_budget",
            headerName: "BUDGET",
            minWidth: 200,
            renderCell: (params) => <BudgetCell value={params.row.daily_budget} campaignId={params.row.Campaign_ID} endDate={params.row.end_date || null} platform={operator}
                onUpdate={(campaignId, newBudget) => {
                    console.log("Updating campaign:", campaignId, "New budget:", newBudget);
                    setCampaignsData(prevData => {
                        const updatedData = {
                            ...prevData,
                            data: prevData.data.map(campaign =>
                                campaign.Campaign_ID === campaignId
                                    ? { ...campaign, daily_budget: newBudget }
                                    : campaign
                            )
                        };
                        console.log("Updated campaignsData:", updatedData);
                        return updatedData;
                    });
                }} onSnackbarOpen={handleSnackbarOpen} />, type: "number", align: "left",
            headerAlign: "left",
        },
        {
            field: "status",
            headerName: "STATUS",
            minWidth: 100,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => {
                if (updatingCampaigns[params.row.campaign_id]) {
                    return <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress size={24} /></Box>;
                }
                return (
                    <Switch
                        checked={params.row.status === 1}
                        onChange={() => handleToggle(params.row.campaign_id, params.row.status === 1 ? 1 : 0, params.row.brand_id)}
                    />
                )
            },
            type: "singleSelect",
            valueOptions: STATUS_OPTIONS
        },
        {
            field: "impressions",
            headerName: "IMPRESSIONS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.impressions} percentValue={params.row.impressions_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

       

        /*{
            field: "atc",
            headerName: " ATC",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.atc} percentValue={params.row.atc_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },*/

        {
            field: "clicks",
            headerName: "CLICKS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.clicks} percentValue={params.row.clicks_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

       {
            field: "spend",
            headerName: "SPENDS",
            minWidth: 170,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.spend} percentValue={params.row.spend_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },
          {
            field: "orders",
            headerName: "ORDERS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.orders} percentValue={params.row.orders_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "sales",
            headerName: "SALES",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.sales} percentValue={params.row.sales_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        

    

        {
            field: "cpm",
            headerName: "CPM",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.cpm} percentValue={params.row.cpm_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

        {
            field: "roas",
            headerName: "ROAS",
            minWidth: 150,
            renderCell: (params) => (
                <ColumnPercentageDataComponent mainValue={params.row.roas} percentValue={params.row.roas_change} />
            ), type: "number", align: "left",
            headerAlign: "left",
        },

    ];



    const getCampaignsData = async () => {
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
            const url = `https://react-api-script.onrender.com/samsonite/campaign?start_date=${startDate}&end_date=${endDate}&platform=${operator}`;
            const cacheKey = `cache:GET:${url}`;

            const cached = getCache(cacheKey);
            if (cached) {
                setCampaignsData(cached);
                setIsLoading(false);
                return;
            }

            const response = await cachedFetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                signal: controller.signal,
            }, { ttlMs: 5 * 60 * 1000, cacheKey });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setCampaignsData(data);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Previous request aborted due to operator change.");
            } else {
                console.error("Failed to fetch keywords data:", error.message);
                setCampaignsData({});
            }
        } finally {
            setIsLoading(false);
        }
    };

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

    // Removed per-page brand fetch to avoid duplicate calls; provider handles it

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

    const handleToggle = (campaignId, campaignType) => {
        setConfirmation({ show: true, campaignId, campaignType });
    };

    const updateCampaignStatus = (campaignId, campaignType) => {
        setConfirmation({ show: false, campaignId, campaignType });
        setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: true, [campaignType]: true }));
        confirmStatusChange(campaignId, campaignType);
    };

    const confirmStatusChange = async (campaignId, campaignType) => {
        try {
            const token = localStorage.getItem("accessToken");
            const params = new URLSearchParams({
                campaign_id: campaignId,
                campaign_type: campaignType,
                platform: operator,
            });
            const response = await fetch(`https://react-api-script.onrender.com/samsonite/update_campaign_status?${params.toString()}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Failed to update campaign status");

            const data = await response.json();
            console.log("Campaign status updated successfully", data);

            setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: false, [campaignType]: false }));

            handleSnackbarOpen("Campaign status updated successfully!", "success");
            getCampaignsData();
        } catch (error) {
            console.error("Error updating campaign status:", error);
            handleSnackbarOpen("Error updating campaign status", "error");
            setUpdatingCampaigns(prev => ({ ...prev, [campaignId]: false, [campaignType]: false }));
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
            <Dialog open={confirmation.show} onClose={() => setConfirmation({ show: false, campaignId: null, campaignType: null })}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>Are you sure you want to change status of this campaign?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmation({ show: false, campaignId: null, campaignType: null })}>Cancel</Button>
                    <Button onClick={() => updateCampaignStatus(confirmation.campaignId, confirmation.campaignType)} color="primary">Confirm</Button>
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

export default CampaignsComponent;
