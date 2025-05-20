"use client";
import { useEffect, useState, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Modal } from '@mui/material';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

// 稼動率計算參考上限（9台機器，每台12小時48筆）
const MAX_PER_MACHINE = 48; // = 432

const convertColor = (value) => {
    if (value) return value < 70 ? 'red' : 'green';
};

const led_api = async () => {
    const res = await fetch('/api/led/all')
    const data = await res.json()

    return data
}

const UtliAllBarChart = (props) => {
    const { setMachineController } = props

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
    const [selectedInfo, setSelectedInfo] = useState(null)
    const chartRef = useRef()

    const handleClick = (event) => {
        const chart = chartRef.current

        if (!chart) return;

        const elements = chart.getElementsAtEventForMode(event, 'nearest', { Intersect: true }, true)
        if (elements.length > 0) {
            const index = elements[0].index
            const label = chart.data.labels[index]
            const details = data[label]

            setSelectedInfo({ label, details })
        }
    }

    const options = {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `稼動率: ${value.toFixed(0)}%`;
                    },
                    afterLabel: function (context) {
                        const label = context.label
                        const machineData = data[label]
                        const details = Object.entries(machineData).map(([machine, count]) => `${machine}: ${Math.floor((count / MAX_PER_MACHINE) * 100)}%\n`)
                        return details;
                    },
                },
            },
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: '總稼動率',
                font: {
                    size: 18,
                },
                padding: {
                    top: 10,
                    bottom: 30
                },
                align: 'center',
            },
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
            const result = await led_api()

            setData(result)
            setLoading(false)
        }

        fetchData()
    }, []);

    useEffect(() => {
        if (!data) return;
        const labels = Object.keys(data)

        if (labels.length == 0) return;

        const total_duration = 30000;
        const interval_duration = total_duration / labels.length;

        let index = 0;
        const interval = setInterval(() => {
            setChartData((prev) => {
                const new_val = (Object.values(data[labels[index]]).reduce((sum, val) => sum + val, 0) / (MAX_PER_MACHINE * 9)) * 100
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
            {loading ? <CircularProgress /> : <Bar ref={chartRef} onClick={handleClick} data={chartData} options={options} />}

            <Modal open={!!selectedInfo} onClose={() => setSelectedInfo(null)}>
                <div style={{ background: 'white', padding: 20, margin: 'auto', marginTop: 100 }}>
                    <h3>{selectedInfo?.label}</h3>
                    <ul>
                        {selectedInfo && Object.entries(selectedInfo.details).map(([machine, value]) => (
                            <li key={machine} onClick={() => setMachineController(machine)} style={{ cursor: 'pointer', padding: '4px 0' }}>{machine}: {Math.floor((value / MAX_PER_MACHINE) * 100)}%</li>
                        ))}
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default UtliAllBarChart;
