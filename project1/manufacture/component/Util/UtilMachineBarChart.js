"use client";
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

// 稼動率計算參考上限（9台機器，每台12小時48筆）
const MAX_PER_MACHINE = 48; // = 432

const convertColor = (value) => {
    if (value) return value < 70 ? 'red' : 'green';
};

const led_api = async (machine) => {
    const res = await fetch(`/api/led/machine?machine=${machine}`)
    const data = await res.json()

    return data
}

const UtliMachineBarChart = (props) => {
    const { machineController } = props

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: '稼動率',
                data: [],
            },
        ],
    });

    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `稼動率: ${value.toFixed(0)}%`;
                    },
                },
            },
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: `${machineController}`,
                font: {
                    size: 18,
                },
                padding: {
                    top: 10,
                    bottom: 30
                },
                align: 'center',
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 60,   // 讓文字斜一點
                    minRotation: 45,
                },
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: (value) => `${value}%`,
                },
                title: {
                    display: true,
                    text: '稼動率',
                },
            },
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const result = await led_api(machineController);
            setData(result);
            setLoading(false);
            setChartData({ // 清空 chartData 再重繪動畫
                labels: [],
                datasets: [
                    {
                        label: '稼動率',
                        data: [],
                    },
                ],
            });
        };

        fetchData();
    }, [machineController]);


    useEffect(() => {
        if (!data) return;
        const labels = Object.keys(data)

        if (labels.length == 0) return;

        const total_duration = 30000;
        const interval_duration = total_duration / labels.length;

        let index = 0;
        const interval = setInterval(() => {
            setChartData((prev) => {
                const new_val = (data[labels[index]] / (MAX_PER_MACHINE)) * 100
                const new_data = [...prev.datasets[0].data, new_val];
                const new_labels = [...prev.labels, labels[index]];

                return {
                    ...prev,
                    labels: new_labels,
                    datasets: [
                        {
                            ...prev.datasets[0],
                            data: new_data,
                            backgroundColor: (context) => convertColor(context.raw),
                        }
                    ]
                }
            });

            index++;
            if (index >= labels.length - 2) {
                clearInterval(interval);
            }
        }, interval_duration)
    }, [data])

    return (
        <div>
            {loading ? <CircularProgress /> : <Bar data={chartData} options={options} />}
        </div>
    );
};

export default UtliMachineBarChart;
