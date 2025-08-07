import { Box, FormControl, MenuItem, Select } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DataPoint, sampleData } from './tempConfigs';
import {   getVillages, getYouthDataByDate } from '../../services/youthNet/Dashboard/UserServices';
import { countUsersByFilter } from '../../utils/Helper';
import { DateFilter } from '../../utils/app.constant';
interface Props {
  userId: string;
}
const MonthlyRegistrationsChart: React.FC<Props>= ({userId}) => {
  const { t } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<string>(DateFilter.THIS_MONTH);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [visibleData, setVisibleData] = useState<any>([]);


  const data = sampleData[selectedRange];

  const handleBarClick = (data: DataPoint, index: number) => {
    setSelectedBar(index);
  };
  const getDateRangeForThisMonth = () => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' }); // e.g., "Feb"
    
    return [`(1 ${month} - ${now.getDate()} ${month})`];
};

  useEffect(() => {
    const getYouthData = async () => {
      try {
        let fromDate;
        let toDate;
        if (selectedRange === DateFilter.THIS_MONTH) {
          const today = new Date();
          const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          console.log(firstDayOfMonth);
          fromDate = firstDayOfMonth;
            toDate = today;
        }
        else if (selectedRange ===  DateFilter.THIS_MONTH) {
          const today = new Date();
          const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
           fromDate = firstDayOfLastMonth;
          toDate = lastDayOfLastMonth;
      } else if (selectedRange ===  DateFilter.LAST_SIX_MONTHS) {
          const today = new Date();
          const firstDayOfLast6Months = new Date(today.getFullYear(), today.getMonth() - 6, 1);
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); 
            fromDate = firstDayOfLast6Months;
          toDate = lastDayOfLastMonth;
      }
      else if (selectedRange ===  DateFilter.LAST_TWELEVE_MONTHS) {
        const today = new Date();
        const firstDayOfLast12Months = new Date(today.getFullYear(), today.getMonth() - 12, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of last month
         fromDate = firstDayOfLast12Months;
        toDate = lastDayOfLastMonth;
    }
     if(fromDate && toDate)
         {

          const villages=await getVillages(userId)
          const villageIds=villages?.map((item: any) => item.id) || []
          
          const response = await getYouthDataByDate(
          fromDate,
          toDate,
          villageIds
        );
       const graphdata= countUsersByFilter({users:response.getUserDetails, filter:selectedRange})
      setVisibleData(graphdata)
      }

      } catch (error) {
        const graphdata= countUsersByFilter({users:[], filter:selectedRange})
        setVisibleData(graphdata)

      }
    };
    if(userId && userId!=="")
    getYouthData();
  }, [selectedRange, userId]);

  return (
    <div style={{ padding: '20px',  background: "linear-gradient(to bottom, #FFFDF6, #F8EFDA)" }}>
      <h3
        style={{
          fontWeight: 500,
          color: 'black',
          marginBottom: '10px',
          marginTop: 0,
        }}
        suppressHydrationWarning
      >
        {t('YOUTHNET_DASHBOARD.MONTHLY_REGISTRATIONS_OVERVIEW')}
      </h3>
      <Box
        sx={{
          padding: '20px',
          border: '1px solid #D0C5B4',
          borderRadius: '16px',
          background: 'white',
        }}
      >
        <FormControl fullWidth style={{ marginBottom: '10px' }}>
          <Select
            sx={{ borderRadius: '8px' }}
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <MenuItem value={DateFilter.THIS_MONTH}>{t('YOUTHNET_DASHBOARD.THIS_MONTH', {dateDetails:getDateRangeForThisMonth()})}</MenuItem>
            <MenuItem value={DateFilter.LAST_SIX_MONTHS}>{t('YOUTHNET_DASHBOARD.LAST_SIX_MONTH')}</MenuItem>
            <MenuItem value={DateFilter.LAST_TWELEVE_MONTHS}>{t('YOUTHNET_DASHBOARD.LAST_TWL_MONTH')}</MenuItem>
          </Select>
        </FormControl>
        <div
  style={{
    width: '100%',
    height: '300px',
    overflowX: 'auto',
    overflowY: 'hidden',
  }}
>
  <ResponsiveContainer
    width="100%"
    height="100%"
    minWidth={Math.max(visibleData?.length * 80, 500)} // Ensures full width when data is limited
  >
 <BarChart
  data={visibleData}
  margin={{ top: 20, right: 40, bottom: 20, left: 20 }} // Adjusted left margin
  barCategoryGap="20%"
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis
    dataKey={selectedRange === DateFilter.THIS_MONTH ? 'date' : 'month'}
    padding={{
      left: visibleData.length > 1 ? (200 / visibleData.length) : 20, 
      right: visibleData.length > 1 ? (200 / visibleData.length) : 20,
    }}
  />
  <YAxis
    orientation="right"
    domain={[
      0,
      Math.ceil(
        Math.max(...visibleData.map((d: any) => d.count), 0) / 5
      ) * 5,
    ]}
    tick={{ fontSize: 12 }}
    interval={0}
    tickFormatter={(value) => value}
    ticks={Array.from(
      {
        length:
          Math.floor(
            (Math.ceil(
              Math.max(...visibleData.map((d: any) => d.count), 0) / 5
            ) *
              5) /
              5
          ) + 1,
      },
      (_, i) => i * 5
    )}
  />
  <Tooltip />
  <Bar
    dataKey="count"
    onClick={(data: any, index: number) => {
      const transformedData: DataPoint = {
        date: data.payload?.date,
        count: data.payload?.count,
      };

      handleBarClick(transformedData, index);
    }}
    radius={[4, 4, 0, 0]}
    shape={(props: any) => {
      const { x, y, width, height, index } = props;
      const isSelected = selectedBar === index;
      // const barColor = isSelected
      //   ? '#008000'
      //   : props.payload.count >= 5
      //   ? '#90ee90'
      //   : '#ffcccb';
      const barColor =
      props.payload.count > 10 ? '#A5DEB8' :
      props.payload.count > 5 ? '#089136' :
      '#EC9E9E';
      return (
        <g>
      {isSelected && (
        <>
          {/* <path
            d={`M0,0 L20,-10 L50,-10 L50,10 L20,10 Z`}
            fill="#008000"
            transform={`translate(${x + width + 10}, ${y - 20})`}
          />
          <text
            x={x + width + 40}
            y={y - 15}
            textAnchor="middle"
            fontSize={14}
            fill="#ffffff"
            fontWeight="bold"
          >
            {props.payload.count}
          </text> */}
        </>
      )}
      <rect x={x} y={y} width={width} height={height} fill={barColor} />
    </g>
      );
    }}
  />
</BarChart>


  </ResponsiveContainer>
</div>

      </Box>
    </div>
  );
};

export default MonthlyRegistrationsChart;
