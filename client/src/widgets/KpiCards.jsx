import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function KpiCards() {
  const [data, setData] = useState({ tasks: 0, openTickets: 0, leaves: 0 })
  useEffect(() => {
    async function load() {
      try {
        const [tasks, tickets, leaves] = await Promise.all([
          api.get('/tasks/mine'),
          api.get('/tickets?scope=assigned'),
          api.get('/leaves/mine'),
        ])
        setData({ tasks: tasks.data.length, openTickets: tickets.data.length, leaves: leaves.data.length })
      } catch {}
    }
    load()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card 
        title="My Tasks" 
        value={data.tasks} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
        gradient="from-blue-500 to-cyan-500"
      />
      <Card 
        title="Open Tickets" 
        value={data.openTickets} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
        gradient="from-orange-500 to-red-500"
      />
      <Card 
        title="My Leaves" 
        value={data.leaves} 
        icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
        gradient="from-green-500 to-emerald-500"
      />
    </div>
  )
}

function Card({ title, value, icon, gradient }) {
  return (
    <div className="relative p-6 overflow-hidden transition-all duration-300 transform bg-white shadow-lg rounded-xl hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
    </div>
  )
}
