import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

const DashboardChart = ({ theme }) => {
  const [timeRange, setTimeRange] = useState(30);
  
  // Sample data - replace with real data
  const generateData = (days) => {
    const data = [];
    const today = new Date();
    
    for(let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        mailOpened: Math.floor(Math.random() * 100),
        urlClicked: Math.floor(Math.random() * 80),
        formPosted: Math.floor(Math.random() * 60),
        attachmentOpened: Math.floor(Math.random() * 40),
        pageNavigation: Math.floor(Math.random() * 20)
      });
    }
    return data;
  };

  const data = generateData(timeRange);

  return (
    <div className={`mt-6 p-6 rounded-lg ${
      theme === 'dark' 
        ? 'bg-[#1A1A1A] border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          Phishing Campaign Statistics for last {timeRange} days
        </h3>
        <div className={`relative group ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          <div className="relative cursor-pointer">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className={`appearance-none py-2 pl-4 pr-8 rounded-lg w-full cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-[#333] border border-gray-600' 
                  : 'bg-white border border-gray-300'
              }`}
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme === 'dark' ? '#444' : '#eee'}
            />
            <XAxis 
              dataKey="date"
              tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
              stroke={theme === 'dark' ? '#666' : '#ccc'}
            />
            <YAxis 
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
              stroke={theme === 'dark' ? '#666' : '#ccc'}
              label={{
                value: 'Hits',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fill: theme === 'dark' ? '#fff' : '#000',
                style: {
                  fontSize: '14px',
                  textAnchor: 'middle'
                }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1A1A1A' : '#fff',
                borderColor: theme === 'dark' ? '#444' : '#ddd',
              }}
              itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value) => (
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {value}
                </span>
              )}
            />
            
            {/* Lines with different colors */}
            <Line 
              type="monotone" 
              dataKey="mailOpened" 
              name="Mail Opened"
              stroke="#FF6B00" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="urlClicked" 
              name="Url Clicked"
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="formPosted" 
              name="Form Posted"
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="attachmentOpened" 
              name="Attachment Opened"
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="pageNavigation" 
              name="Page Navigation"
              stroke="#EF4444" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

DashboardChart.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default DashboardChart;