'use client'

import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

export function SalesChart() {
    const data = {
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        datasets: [
            {
                label: 'Penjualan (IDR)',
                data: [1200000, 1900000, 1500000, 2100000, 2800000, 4500000, 3800000],
                backgroundColor: '#FF69B4',
                borderRadius: 8,
            },
        ],
    }

    return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
}

export function CategoryPie() {
    const data = {
        labels: ['Cake', 'Cupcake', 'Cookies', 'Custom'],
        datasets: [
            {
                data: [45, 20, 15, 20],
                backgroundColor: ['#FF69B4', '#8B4513', '#FFB6C1', '#A1887F'],
            },
        ],
    }

    return <Pie data={data} />
}
