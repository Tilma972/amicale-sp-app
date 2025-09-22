'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell,Calendar, MapPin, MessageSquare, ShoppingBag, TrendingUp, Trophy, Users } from 'lucide-react'

import { createClient } from '@supabase/supabase-js'

interface DashboardStats {
  totalCalendarsDistributed: number
  totalAmount: number
  activeTeams: number
  activeTournees: number
  totalAnnonces: number
  nextEvent: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCalendarsDistributed: 387,
    totalAmount: 3870,
    activeTeams: 4,
    activeTournees: 1,
    totalAnnonces: 12,
    nextEvent: "Assemblée générale - 15 Oct"
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    async function loadDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data: dashboardData } = await supabase
          .from('v_sapeur_dashboard')
          .select('calendars_distributed, total_amount, team_id')

        if (dashboardData) {
          const totalCalendars = dashboardData.reduce((sum, item) => sum + (item.calendars_distributed || 0), 0)
          const totalMontant = dashboardData.reduce((sum, item) => sum + (item.total_amount || 0), 0)
          const uniqueTeams = new Set(dashboardData.map(item => item.team_id).filter(Boolean)).size

          const { data: activeTournees } = await supabase
            .from('tournees')
            .select('id')
            .eq('status', 'en_cours')

          setStats({
            totalCalendarsDistributed: totalCalendars,
            totalAmount: Math.round(totalMontant),
            activeTeams: uniqueTeams,
            activeTournees: activeTournees?.length || 0,
            totalAnnonces: 12,
            nextEvent: "Assemblée générale - 15 Oct"
          })
        }
      } catch (error) {
        console.error('Erreur chargement dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const menuItems = [
    {
      title: "Tournées & Calendriers",
      description: "Gestion des distributions",
      icon: Calendar,
      color: "bg-blue-500",
      colorLight: "bg-blue-50",
      colorBorder: "border-blue-200",
      href: "/dashboard/calendriers",
      stats: [
        { label: "Calendriers distribués", value: stats.totalCalendarsDistributed },
        { label: "Montant collecté", value: `${stats.totalAmount}€` },
        { label: "Tournées actives", value: stats.activeTournees }
      ]
    },
    {
      title: "Petites Annonces",
      description: "Ventes entre collègues",
      icon: ShoppingBag,
      color: "bg-emerald-500",
      colorLight: "bg-emerald-50",
      colorBorder: "border-emerald-200",
      href: "/dashboard/annonces",
      stats: [
        { label: "Annonces actives", value: stats.totalAnnonces },
        { label: "Nouvelles cette semaine", value: 3 },
        { label: "Vues aujourd'hui", value: 24 }
      ]
    },
    {
      title: "Galerie SP",
      description: "Photos & moments",
      icon: Trophy,
      color: "bg-purple-500",
      colorLight: "bg-purple-50",
      colorBorder: "border-purple-200",
      href: "/dashboard/galerie",
      stats: [
        { label: "Photos partagées", value: 8 },
        { label: "Dernière photo", value: "Il y a 2h" },
        { label: "Likes cette semaine", value: 47 }
      ]
    },
    {
      title: "Annonces & Événements",
      description: "Événements & prêts",
      icon: Bell,
      color: "bg-orange-500",
      colorLight: "bg-orange-50",
      colorBorder: "border-orange-200",
      href: "/dashboard/associative",
      stats: [
        { label: "Prochain événement", value: stats.nextEvent || "Aucun" },
        { label: "Prêts en cours", value: 5 },
        { label: "Participants inscrits", value: 18 }
      ]
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Amicale des Sapeurs-Pompiers
              </h1>
              <p className="text-gray-600">
                Tableau de bord - Bienvenue {user?.email?.split('@')[0]}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats générales */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calendriers distribués</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCalendarsDistributed}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant collecté</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAmount}€</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Équipes actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTeams}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tournées en cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTournees}</p>
              </div>
              <MapPin className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Menu principal avec infos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                onClick={() => router.push(item.href)}
                className={`${item.colorLight} ${item.colorBorder} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations contextuelles */}
                <div className="space-y-2">
                  {item.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="text-sm font-medium text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Indicateur de navigation */}
                <div className="mt-4 flex items-center text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  <span>Accéder</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}