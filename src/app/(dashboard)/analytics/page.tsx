'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2, Info, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import * as d3 from 'd3'

interface Restaurant {
  id: string
  name: string
  code: string
}

interface AnalyticsData {
  totalOrders: number
  ordersByRestaurant: { restaurant: string; count: number }[]
  ordersBySize: { size: string; count: number }[]
  ordersByType: { type: string; count: number }[]
  ordersByMonth: { month: string; count: number }[]
  ordersByLocation: { location: string; count: number }[]
  delayStats: { onTime: number; delayed: number; rate: number }
  peakHourStats: { hour: number; count: number }[]
  paymentStats: { method: string; count: number }[]
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  pink: '#ec4899',
  purple: '#8b5cf6',
  cyan: '#06b6d4'
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: string
}

function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })

  const showTooltip = (e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      x: e.clientX + 10,
      y: e.clientY - 30,
      content
    })
  }

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  return { tooltip, showTooltip, hideTooltip }
}

interface ChartCardProps {
  title: string
  description: string
  explanation: string
  children: React.ReactNode
  className?: string
}

function ChartCard({ title, description, explanation, children, className = '' }: ChartCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="Lihat penjelasan"
          >
            <Info className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px]">
          {children}
        </div>
        
        {showExplanation && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{explanation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InteractiveLineChart({ data, color = COLORS.primary }: { data: { label: string, value: number }[], color?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 200
    
    if (width === 0) return

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint().domain(data.map(d => d.label)).range([0, innerWidth]).padding(0.5)
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 0]).nice().range([innerHeight, 0])

    const line = d3.line<{ label: string, value: number }>()
      .x(d => x(d.label) || 0)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)

    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.label) || 0)
      .attr('cy', d => y(d.value))
      .attr('r', 5)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 7)
        showTooltip(event as any, `${d.label}: ${d.value} order`)
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5)
        hideTooltip()
      })

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '11px')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '11px')

    return () => {
      svg.remove()
    }
  }, [data, color, showTooltip, hideTooltip])

  return (
    <>
      <div ref={containerRef} className="w-full" />
      {tooltip.visible && (
        <div 
          className="fixed bg-slate-800 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  )
}

function InteractiveBarChart({ data, color = COLORS.primary }: { data: { label: string, value: number }[], color?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 200
    
    if (width === 0) return

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = { top: 20, right: 20, bottom: 60, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([innerHeight, 0])

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.label) || 0)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', color)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8)
        showTooltip(event as any, `${d.label}: ${d.value} order`)
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1)
        hideTooltip()
      })

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#64748b')
      .style('font-size', '11px')

    return () => {
      svg.remove()
    }
  }, [data, color, showTooltip, hideTooltip])

  return (
    <>
      <div ref={containerRef} className="w-full" />
      {tooltip.visible && (
        <div 
          className="fixed bg-slate-800 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  )
}

function InteractivePieChart({ data, colors }: { data: { label: string, value: number }[], colors?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { tooltip, showTooltip, hideTooltip } = useTooltip()
  const defaultColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4']

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = 180
    
    if (width === 0) return

    const size = Math.min(width, height) * 0.8
    const radius = size / 2

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(colors || defaultColors)

    const pie = d3.pie<{ label: string, value: number }>()
      .value(d => d.value)
      .sort(null)

    const arc = d3.arc<d3.PieArcDatum<{ label: string, value: number }>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius)

    g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)')
        const percent = ((d.data.value / data.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)
        showTooltip(event as any, `${d.data.label}: ${d.data.value} (${percent}%)`)
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)')
        hideTooltip()
      })

    return () => {
      svg.remove()
    }
  }, [data, colors, showTooltip, hideTooltip])

  const chartColors = colors || defaultColors

  return (
    <>
      <div ref={containerRef} className="w-full flex justify-center" />
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.label} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full">
            <div 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: chartColors[i % chartColors.length] }} 
            />
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
      {tooltip.visible && (
        <div 
          className="fixed bg-slate-800 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  )
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const userRestaurantId = (session?.user as any)?.restaurantId
  const isSuperAdmin = userRole === 'GM' || userRole === 'ADMIN_PUSAT'
  const isManager = userRole === 'MANAGER'

  const canAccess = isSuperAdmin || isManager

  useEffect(() => {
    if (status === 'authenticated' && canAccess) {
      loadData()
    }
  }, [status, canAccess])

  useEffect(() => {
    if (selectedRestaurant && canAccess) {
      loadAnalytics()
    }
  }, [selectedRestaurant])

  const loadData = async () => {
    try {
      const restaurantsRes = await fetch('/api/upload')
      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json()
        setRestaurants(restaurantsData)
        
        if (userRestaurantId) {
          setSelectedRestaurant(userRestaurantId)
        } else if (restaurantsData.length > 0) {
          setSelectedRestaurant(restaurantsData[0].id)
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Gagal memuat data')
    }
  }

  const loadAnalytics = async () => {
    if (!selectedRestaurant) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const url = `/api/analytics?restaurantId=${selectedRestaurant}`
      const res = await fetch(url)
      
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        setError('Gagal memuat analytics')
      }
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || (canAccess && isLoading && !data)) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
          <p className="text-slate-500">Analisis data delivery pizza</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-500">Memuat data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500">Analisis data delivery pizza</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-500">Anda tidak memiliki akses ke halaman Analytics. Hubungi manager untuk akses.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
          <p className="text-slate-500">Analisis data delivery pizza</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <p className="text-slate-500">{error}</p>
              <button 
                onClick={loadData}
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = data && data.totalOrders > 0

  if (!hasData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
            <p className="text-slate-500">Analisis data delivery pizza dengan insights actionable</p>
          </div>

          {isSuperAdmin && restaurants.length > 0 && (
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih restoran" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} ({restaurant.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 mb-4 opacity-30 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-slate-800">Belum Ada Data</h3>
            <p className="text-center mb-6 max-w-md text-slate-500">
              Data delivery belum tersedia. Silakan upload data order terlebih dahulu untuk melihat analytics dan insights.
            </p>
            <Link 
              href="/upload"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Upload className="w-5 h-5" />
              Upload Data
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPeakHour = () => {
    if (!data?.peakHourStats?.length) return '-'
    const sorted = [...data.peakHourStats].sort((a, b) => b.count - a.count)
    return sorted[0]?.hour !== undefined ? `${sorted[0].hour}:00` : '-'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics & Insights</h1>
          <p className="text-slate-500">Analisis data delivery pizza dengan insights actionable</p>
        </div>

        {isSuperAdmin && restaurants.length > 0 && (
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Pilih restoran" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} ({restaurant.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {userRestaurantId && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100">
            <span className="text-sm font-medium text-slate-700">
              {restaurants.find(r => r.id === userRestaurantId)?.name || 'Restoran Anda'}
            </span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Total Orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">
              {data.totalOrders.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> On-Time Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {data.delayStats.rate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Delayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {data.delayStats.delayed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Peak Hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-800">
              {getPeakHour()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Orders by Month"
          description="Tren order per bulan"
          explanation="Grafik ini menunjukkan pola musiman dalam jumlah pesanan. Identifikasi bulan-bulan dengan peningkatan pesanan untuk perencanaan marketing dan staffing."
        >
          <InteractiveLineChart 
            data={data.ordersByMonth.map(d => ({ 
              label: d.month.slice(0, 3), 
              value: d.count 
            }))} 
            color="#f97316"
          />
        </ChartCard>

        {isSuperAdmin && data.ordersByRestaurant.length > 0 && (
          <ChartCard 
            title="Orders by Restaurant"
            description="Perbandingan antar restoran"
            explanation="Membandingkan performa antar restoran dalam jumlah pesanan. Data ini berguna untuk evaluasi cabang dan alokasi sumber daya."
          >
            <InteractiveBarChart 
              data={data.ordersByRestaurant.map(d => ({ 
                label: d.restaurant.slice(0, 10), 
                value: d.count 
              }))} 
              color="#3b82f6"
            />
          </ChartCard>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard 
          title="Orders by Pizza Size"
          description="Distribusi ukuran pizza"
          explanation="Menampilkan preferensi pelanggan terhadap ukuran pizza. Data ini membantu menentukan stok bahan baku yang paling banyak dibutuhkan."
        >
          <InteractivePieChart 
            data={data.ordersBySize.map(d => ({ 
              label: d.size, 
              value: d.count 
            }))} 
          />
        </ChartCard>

        <ChartCard 
          title="Orders by Pizza Type"
          description="Distribusi jenis pizza"
          explanation="Menunjukkan popularitas berbagai jenis pizza. Gunakan data ini untuk mengoptimalkan menu dan strategi marketing."
        >
          <InteractivePieChart 
            data={data.ordersByType.map(d => ({ 
              label: d.type, 
              value: d.count 
            }))} 
            colors={['#2563eb', '#7c3aed', '#059669', '#dc2626', '#f59e0b', '#06b6d4']}
          />
        </ChartCard>

        <ChartCard 
          title="Payment Methods"
          description="Metode pembayaran favorit"
          explanation="Memperlihatkan preferensi pelanggan dalam metode pembayaran. Pastikan metode yang paling populer selalu tersedia."
        >
          <InteractivePieChart 
            data={data.paymentStats.map(d => ({ 
              label: d.method, 
              value: d.count 
            }))} 
            colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
          />
        </ChartCard>
      </div>

      {data.ordersByLocation.length > 0 && (
        <ChartCard 
          title="Top Locations"
          description="Lokasi dengan order tertinggi"
          explanation="Menampilkan area dengan permintaan tertinggi. Data ini membantu perencanaan ekspansi dan strategi delivery untuk area spesifik."
        >
          <InteractiveBarChart 
            data={data.ordersByLocation.slice(0, 8).map(d => ({ 
              label: d.location.split(',')[0] || d.location, 
              value: d.count 
            }))} 
            color="#22c55e"
          />
        </ChartCard>
      )}

      {data.peakHourStats.length > 0 && (
        <ChartCard 
          title="Orders by Hour"
          description="Distribusi order per jam"
          explanation="Identifikasi jam-jam sibuk untuk optimasi jadwal driver dan persiapan. Tingkatkan staffing pada jam dengan volume tinggi."
        >
          <InteractiveBarChart 
            data={data.peakHourStats.map(d => ({ 
              label: `${d.hour}:00`, 
              value: d.count 
            }))} 
            color="#8b5cf6"
          />
        </ChartCard>
      )}
    </div>
  )
}
