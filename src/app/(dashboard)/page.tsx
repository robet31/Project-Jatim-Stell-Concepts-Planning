'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import * as d3 from 'd3'
import { 
  ShoppingCart, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Calendar,
  CalendarDays,
  Zap,
  ArrowUpRight,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  avgDeliveryTime: number
  delayedOrders: number
  onTimeRate: number
  peakHours: { label: string; value: number }[]
  pizzaSizes: { label: string; value: number }[]
  pizzaTypes: { label: string; value: number }[]
  deliveryPerformance: { label: string; value: number }[]
  trafficImpact: { label: string; value: number }[]
  paymentMethods: { label: string; value: number }[]
  weekendVsWeekday: { weekend: number; weekday: number }
  peakOffPeak: { peak: number; offPeak: number }
  avgDistanceKm: number
  avgDelayMin: number
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

// Global tooltip component that follows cursor
function Tooltip({ visible, x, y, content }: { visible: boolean; x: number; y: number; content: string }) {
  if (!visible) return null
  return (
    <div 
      className="fixed bg-slate-800 text-white px-3 py-2 rounded-lg text-sm z-[9999] pointer-events-none shadow-lg border border-slate-600"
      style={{ 
        left: x, 
        top: y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px'
      }}
    >
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  
  // Global tooltip state
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: ''
  })

  const showTooltip = useCallback((e: React.MouseEvent, content: string) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content
    })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  const userRole = (session?.user as any)?.role || (session?.user as any)?.position || 'STAFF'
  const userName = session?.user?.name || ''
  const allowedRoles = ['MANAGER', 'GM', 'ADMIN_PUSAT']

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!allowedRoles.includes(userRole)) {
        router.push('/upload')
      }
    }
  }, [status, userRole, router])

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/dashboard/charts')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error)
    }

    fetchData()
  }, [])

  if (status === 'loading' || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-white/80 mt-6 text-lg font-medium">Memuat Dashboard...</p>
        </div>
      </div>
    )
  }

  const hasData = stats && stats.totalOrders > 0

  if (!hasData) {
    return (
      <div className="min-h-screen bg-slate-50">
      <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgb(72, 148, 199) 0%, rgb(70, 147, 198) 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>Selamat datang, <span className="font-semibold text-white">{userName}</span></p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Belum Ada Data</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Data delivery belum tersedia. Silakan upload data order terlebih dahulu untuk melihat dashboard analytics.
            </p>
            <Link 
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Upload Data
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Global Tooltip */}
      <Tooltip {...tooltip} />
      
      {/* Header */}
        <div className="text-white p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgb(72, 148, 199) 0%, rgb(70, 147, 198) 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                Dashboard
              </h1>
              <p className="mt-2 text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.8)' }}>Selamat datang, <span className="font-semibold text-white">{userName}</span></p>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/20 px-4 py-2 rounded-full" style={{ color: 'white' }}>
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          
          {/* Main KPI Cards - Row 1 */}
          <div className="lg:col-span-3">
            <KPICard 
              title="Total Pesanan" 
              value={stats?.totalOrders?.toLocaleString() || '0'} 
              unit=""
              icon={<ShoppingCart className="w-6 h-6" />}
              color="#3b82f6"
              bgColor="from-blue-600 to-blue-700"
              subtext="Performa bisnis stabil"
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Tepat Waktu" 
              value={`${stats?.onTimeRate || 0}`} 
              unit="%"
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              color="text-green-600"
              bgColor="bg-green-50"
              progress={stats?.onTimeRate || 0}
              subtext={`${stats?.delayedOrders || 0} dari ${stats?.totalOrders || 0} order`}
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Terlambat" 
              value={String(stats?.delayedOrders || 0)} 
              unit=""
              icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
              color="text-red-600"
              bgColor="bg-red-50"
              subtext={`${((stats?.delayedOrders || 0) / (stats?.totalOrders || 1) * 100).toFixed(1)}% dari total`}
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Avg. Waktu" 
              value={String(stats?.avgDeliveryTime || 0)} 
              unit="menit"
              icon={<Clock className="w-6 h-6 text-purple-600" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
              subtext="Rata-rata per pengiriman"
            />
          </div>

          {/* Row 2: Distribusi Pizza Size | Tren Pesanan */}
          {/* Distribusi Pizza Size */}
          <div className="lg:col-span-4">
            <PizzaSizeCard stats={stats} />
          </div>

          {/* Tren Pesanan - Full Width */}
          <div className="lg:col-span-8">
            <ChartSection 
              title="Tren Pesanan" 
              description="Pertumbuhan pesanan per bulan"
              explanation="Grafik ini menunjukkan tren jumlah pesanan dari waktu ke waktu. Naik turunnya garis menunjukkan pola musiman atau perubahan permintaan pelanggan."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.deliveryPerformance && stats.deliveryPerformance.length > 0 ? (
                <AreaChart data={stats.deliveryPerformance} showTooltip={showTooltip} hideTooltip={hideTooltip} />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

          {/* Row 3: Secondary Stats - Avg Jarak, Jam Sibuk, Weekend, Avg Delay */}
          <div className="lg:col-span-3">
            <KPICard 
              title="Avg. Jarak" 
              value={String(stats?.avgDistanceKm || 0)} 
              unit="km"
              icon={<MapPin className="w-6 h-6 text-amber-600" />}
              color="text-amber-600"
              bgColor="bg-amber-50"
              subtext="Jarak rata-rata pengiriman"
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Jam Sibuk" 
              value={String(stats?.peakOffPeak?.peak || 0)} 
              unit=""
              icon={<Zap className="w-6 h-6 text-cyan-600" />}
              color="text-cyan-600"
              bgColor="bg-cyan-50"
              subtext="Order pada jam sibuk"
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Weekend" 
              value={String(stats?.weekendVsWeekday?.weekend || 0)} 
              unit=""
              icon={<CalendarDays className="w-6 h-6 text-purple-600" />}
              color="text-purple-600"
              bgColor="bg-purple-50"
              subtext="Order hari libur"
            />
          </div>

          <div className="lg:col-span-3">
            <KPICard 
              title="Avg. Delay" 
              value={String(stats?.avgDelayMin || 0)} 
              unit="min"
              icon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
              color="text-rose-600"
              bgColor="bg-rose-50"
              subtext="Rata-rata keterlambatan"
            />
          </div>

          {/* Row 3: Jam Sibuk & Dampak Lalu Lintas */}
          <div className="lg:col-span-6">
            <ChartSection 
              title="Jam Sibuk" 
              description="Jam dengan pesanan tertinggi"
              explanation="Grafik batang menunjukkan jam-jam dengan volume pesanan tertinggi. Identifikasi jam sibuk untuk menambah driver."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.peakHours && stats.peakHours.length > 0 ? (
                <BarChart data={stats.peakHours} showTooltip={showTooltip} hideTooltip={hideTooltip} />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

          <div className="lg:col-span-6">
            <ChartSection 
              title="Dampak Lalu Lintas" 
              description="Pengiriman berdasarkan kondisi lalu lintas"
              explanation="Membandingkan jumlah pengiriman pada kondisi lalu lintas. Data ini membantu estimasi waktu pengiriman."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.trafficImpact && stats.trafficImpact.length > 0 ? (
                <HBarChart data={stats.trafficImpact} showTooltip={showTooltip} hideTooltip={hideTooltip} />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

          {/* Row 4: Weekend vs Weekday, Jenis Pizza & Payment */}
          <div className="lg:col-span-4">
            <ChartSection 
              title="Weekend vs Weekday" 
              description="Distribusi pesanan hari kerja vs libur"
              explanation="Membandingkan jumlah pesanan pada hari kerja dengan akhir pekan. Data ini membantu perencanaan staffing."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.weekendVsWeekday && (stats.weekendVsWeekday.weekend > 0 || stats.weekendVsWeekday.weekday > 0) ? (
                <PieChart 
                  data={[
                    { label: 'Weekend', value: stats.weekendVsWeekday.weekend },
                    { label: 'Weekday', value: stats.weekendVsWeekday.weekday }
                  ]} 
                  colors={['#8b5cf6', '#3b82f6']}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

          {/* Jenis Pizza */}
          <div className="lg:col-span-4">
            <ChartSection 
              title="Jenis Pizza" 
              description="Distribusi menu favorit"
              explanation="Menampilkan popularitas berbagai jenis pizza. Data ini membantu memahami preferensi pelanggan dan mengoptimalkan strategi marketing."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.pizzaTypes && stats.pizzaTypes.length > 0 ? (
                <BarChart data={stats.pizzaTypes} color="#8b5cf6" showTooltip={showTooltip} hideTooltip={hideTooltip} />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

          <div className="lg:col-span-4">
            <ChartSection 
              title="Metode Pembayaran" 
              description="Distribusi metode pembayaran"
              explanation="Menunjukkan preferensi pelanggan dalam metode pembayaran. Pastikan metode populer selalu tersedia."
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
            >
              {stats?.paymentMethods && stats.paymentMethods.length > 0 ? (
                <PieChart 
                  data={stats.paymentMethods} 
                  colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']}
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                />
              ) : <EmptyChart />}
            </ChartSection>
          </div>

        </div>
      </div>
    </div>
  )
}

function KPICard({ 
  title, 
  value, 
  unit,
  icon, 
  color,
  bgColor = 'bg-slate-50',
  subtext,
  progress,
  isGradient = false
}: { 
  title: string
  value: string
  unit?: string
  icon: React.ReactNode
  color?: string
  bgColor?: string
  subtext?: string
  progress?: number
  isGradient?: boolean
}) {
  return (
    <div 
      className={`rounded-2xl p-6 shadow-sm border h-full flex flex-col justify-between ${isGradient ? '' : 'bg-white border-slate-200'}`}
      style={isGradient ? { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' } : {}}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm mb-1 ${isGradient ? 'text-blue-200' : 'text-slate-500'}`}>{title}</p>
          <p className={`text-4xl font-bold ${isGradient ? 'text-white' : color || 'text-slate-800'}`}>
            {value} 
            {unit && <span className={`text-lg font-normal ${isGradient ? 'text-blue-200' : 'text-slate-400'}`}> {unit}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isGradient ? 'bg-white/20' : bgColor}`}>
          {icon}
        </div>
      </div>
      
      {progress !== undefined && !isGradient && (
        <div className="mt-4">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div>
          </div>
        </div>
      )}
      
      {subtext && (
        <p className={`text-sm mt-4 ${isGradient ? 'text-blue-200' : 'text-slate-400'}`}>
          {subtext}
        </p>
      )}
    </div>
  )
}

function ChartSection({ 
  title, 
  description, 
  explanation, 
  children,
  showTooltip,
  hideTooltip
}: { 
  title: string
  description: string
  explanation: string
  children: React.ReactNode
  showTooltip: (e: React.MouseEvent, content: string) => void
  hideTooltip: () => void
}) {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-slate-500 text-xs">{description}</p>
        </div>
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
          title="Lihat penjelasan"
        >
          <Info className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      <div className="h-64">
        {children}
      </div>

      {showExplanation && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800">{explanation}</p>
        </div>
      )}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
        <ShoppingCart className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-slate-400 text-sm">Belum ada data</p>
    </div>
  )
}

function PizzaSizeCard({ stats }: { stats: DashboardStats | null }) {
  const [showExplanation, setShowExplanation] = useState(false)
  const total = stats?.pizzaSizes?.reduce((sum, item) => sum + item.value, 0) || 0

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800">Distribusi Pizza Size</h3>
          <p className="text-slate-500 text-xs">Jumlah pesanan berdasarkan ukuran</p>
        </div>
        <button 
          onClick={() => setShowExplanation(!showExplanation)}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
          title="Lihat penjelasan"
        >
          <Info className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {stats?.pizzaSizes && stats.pizzaSizes.length > 0 ? (
          <div className="space-y-3">
            {stats.pizzaSizes.map((size, index) => {
              const percentage = total > 0 ? ((size.value / total) * 100).toFixed(1) : '0'
              return (
                <div key={size.label} className="relative">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                        style={{backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]}}
                      >
                        {size.label[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{size.label}</span>
                        <span className="text-xs text-slate-500">{percentage}% dari total</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 text-lg">{size.value}</span>
                      <span className="text-xs text-slate-400 ml-1 block">order</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <ShoppingCart className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm">Belum ada data</p>
          </div>
        )}
      </div>

      {showExplanation && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800">
            Menampilkan jumlah pesanan untuk setiap ukuran pizza. Persentase dihitung dari total {total} order. 
            Data ini membantu menentukan stok bahan baku yang paling banyak dibutuhkan.
          </p>
        </div>
      )}
    </div>
  )
}

// Chart Components with proper tooltip handling
function AreaChart({ data, showTooltip, hideTooltip }: { data: { label: string, value: number }[], showTooltip: (e: React.MouseEvent, content: string) => void, hideTooltip: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    
    if (width === 0 || height === 0) return

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = { top: 10, right: 30, bottom: 40, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scalePoint().domain(data.map(d => d.label)).range([0, innerWidth]).padding(0.5)
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 0]).nice().range([innerHeight, 0])

    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient')
      .attr('id', 'areaGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', COLORS.primary).attr('stop-opacity', 0.3)
    gradient.append('stop').attr('offset', '100%').attr('stop-color', COLORS.primary).attr('stop-opacity', 0)

    const area = d3.area<{ label: string, value: number }>()
      .x(d => x(d.label) || 0).y0(innerHeight).y1(d => y(d.value)).curve(d3.curveMonotoneX)
    g.append('path').datum(data).attr('fill', 'url(#areaGradient)').attr('d', area)

    const line = d3.line<{ label: string, value: number }>()
      .x(d => x(d.label) || 0).y(d => y(d.value)).curve(d3.curveMonotoneX)
    g.append('path').datum(data).attr('fill', 'none').attr('stroke', COLORS.primary).attr('stroke-width', 3).attr('d', line)

    g.selectAll('.dot').data(data).enter().append('circle')
      .attr('cx', d => x(d.label) || 0).attr('cy', d => y(d.value)).attr('r', 5)
      .attr('fill', COLORS.primary).attr('stroke', 'white').attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mousemove', function(event, d) {
        d3.select(this).attr('r', 7)
        showTooltip(event as any, `${d.label}: ${d.value} pesanan`)
      })
      .on('mouseout', function() {
        d3.select(this).attr('r', 5)
        hideTooltip()
      })

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x))
      .selectAll('text').attr('fill', '#64748b').style('font-size', '11px')
    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('fill', '#64748b').style('font-size', '11px')

    return () => { svg.remove() }
  }, [data, showTooltip, hideTooltip])

  return <div ref={containerRef} className="w-full h-full" />
}

function BarChart({ data, color = COLORS.secondary, showTooltip, hideTooltip }: { data: { label: string, value: number }[], color?: string, showTooltip: (e: React.MouseEvent, content: string) => void, hideTooltip: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    
    if (width === 0 || height === 0) return

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = { top: 10, right: 10, bottom: 60, left: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerWidth]).padding(0.4)
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 0]).nice().range([innerHeight, 0])

    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', d => x(d.label) || 0).attr('y', d => y(d.value))
      .attr('width', x.bandwidth()).attr('height', d => innerHeight - y(d.value))
      .attr('fill', color).attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mousemove', function(event, d) {
        d3.select(this).attr('opacity', 0.8)
        showTooltip(event as any, `${d.label}: ${d.value} order`)
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1)
        hideTooltip()
      })

    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x))
      .selectAll('text').attr('fill', '#64748b').style('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')

    g.append('g').call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('fill', '#64748b').style('font-size', '10px')

    return () => { svg.remove() }
  }, [data, color, showTooltip, hideTooltip])

  return <div ref={containerRef} className="w-full h-full" />
}

function PieChart({ data, colors, showTooltip, hideTooltip }: { data: { label: string, value: number }[], colors?: string[], showTooltip: (e: React.MouseEvent, content: string) => void, hideTooltip: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const defaultColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#06b6d4']

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight - 40 // space for legend
    
    if (width === 0 || height === 0) return

    const size = Math.min(width, height) * 0.7
    const radius = size / 2

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal<string>().domain(data.map(d => d.label)).range(colors || defaultColors)
    const pie = d3.pie<{ label: string, value: number }>().value(d => d.value).sort(null)
    const arc = d3.arc<d3.PieArcDatum<{ label: string, value: number }>>().innerRadius(radius * 0.5).outerRadius(radius)

    const total = data.reduce((a, b) => a + b.value, 0)

    g.selectAll('.arc').data(pie(data)).enter().append('path')
      .attr('d', arc).attr('fill', d => color(d.data.label)).attr('stroke', 'white').attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mousemove', function(event, d) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)')
        const percent = ((d.data.value / total) * 100).toFixed(1)
        showTooltip(event as any, `${d.data.label}: ${d.data.value} (${percent}%)`)
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)')
        hideTooltip()
      })

    return () => { svg.remove() }
  }, [data, colors, showTooltip, hideTooltip])

  const chartColors = colors || defaultColors

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={containerRef} className="flex-1" />
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[i % chartColors.length] }} />
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HBarChart({ data, showTooltip, hideTooltip }: { data: { label: string, value: number }[], showTooltip: (e: React.MouseEvent, content: string) => void, hideTooltip: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight
    
    if (width === 0 || height === 0) return

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height)

    const margin = { top: 10, right: 50, bottom: 10, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    const x = d3.scaleLinear().domain([0, d3.max(data, d => d.value) || 0]).range([0, innerWidth])
    const y = d3.scaleBand().domain(data.map(d => d.label)).range([0, innerHeight]).padding(0.3)

    g.selectAll('.bar').data(data).enter().append('rect')
      .attr('x', 0).attr('y', d => y(d.label) || 0)
      .attr('width', d => x(d.value)).attr('height', y.bandwidth())
      .attr('fill', COLORS.accent).attr('rx', 6)
      .style('cursor', 'pointer')
      .on('mousemove', function(event, d) {
        d3.select(this).attr('fill', COLORS.primary)
        showTooltip(event as any, `${d.label}: ${d.value} pengiriman`)
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', COLORS.accent)
        hideTooltip()
      })

    g.selectAll('.val').data(data).enter().append('text')
      .attr('x', d => x(d.value) + 8).attr('y', d => (y(d.label) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em').attr('fill', '#475569').style('font-size', '12px').style('font-weight', '600')
      .text(d => d.value)

    g.append('g').call(d3.axisLeft(y))
      .selectAll('text').attr('fill', '#475569').style('font-size', '12px').style('font-weight', '500')

    return () => { svg.remove() }
  }, [data, showTooltip, hideTooltip])

  return <div ref={containerRef} className="w-full h-full" />
}
