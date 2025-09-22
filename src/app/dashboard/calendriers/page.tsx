'use client'

import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AlertCircle,
  ArrowLeft, 
  Award,
  Calendar, 
  CheckCircle,
  Clock,
  Euro,
  MapPin,
  Play, 
  Target, 
  TrendingUp, 
  Users} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'
import { useTourneeData } from '@/shared/hooks/useTourneeData'

interface EquipeProgression {
  id: string
  nom: string
  couleur: string
  calendriers_objectif: number
  calendriers_distribues: number
  montant_collecte: number
  sapeurs_actifs: number
  derniere_activite: string
  statut: 'active' | 'completed' | 'paused'
}

interface MesTournees {
  id: string
  date: string
  calendriers_distribues: number
  montant: number
  statut: 'completed' | 'active'
}

interface MonStatut {
  tournee_active: boolean
  calendriers_restants: number
  montant_total: number
  position_equipe: number
  total_equipe: number
}

// Données mock pour la démo
const mockEquipes: EquipeProgression[] = [
  {
    id: '1',
    nom: 'Équipe Alpha',
    couleur: '#3B82F6',
    calendriers_objectif: 500,
    calendriers_distribues: 387,
    montant_collecte: 3870,
    sapeurs_actifs: 4,
    derniere_activite: '2024-01-15T14:30:00Z',
    statut: 'active'
  },
  {
    id: '2',
    nom: 'Équipe Bravo',
    couleur: '#10B981',
    calendriers_objectif: 450,
    calendriers_distribues: 423,
    montant_collecte: 4230,
    sapeurs_actifs: 3,
    derniere_activite: '2024-01-15T16:45:00Z',
    statut: 'active'
  },
  {
    id: '3',
    nom: 'Équipe Charlie',
    couleur: '#F59E0B',
    calendriers_objectif: 400,
    calendriers_distribues: 400,
    montant_collecte: 4000,
    sapeurs_actifs: 5,
    derniere_activite: '2024-01-14T18:20:00Z',
    statut: 'completed'
  },
  {
    id: '4',
    nom: 'Équipe Delta',
    couleur: '#8B5CF6',
    calendriers_objectif: 350,
    calendriers_distribues: 245,
    montant_collecte: 2450,
    sapeurs_actifs: 2,
    derniere_activite: '2024-01-13T12:15:00Z',
    statut: 'active'
  }
]

const mockMesTournees: MesTournees[] = [
  {
    id: '1',
    date: '2024-01-14',
    calendriers_distribues: 23,
    montant: 230,
    statut: 'completed'
  },
  {
    id: '2',
    date: '2024-01-12',
    calendriers_distribues: 18,
    montant: 180,
    statut: 'completed'
  },
  {
    id: '3',
    date: '2024-01-10',
    calendriers_distribues: 31,
    montant: 310,
    statut: 'completed'
  }
]

const mockMonStatut: MonStatut = {
  tournee_active: false,
  calendriers_restants: 47,
  montant_total: 720,
  position_equipe: 2,
  total_equipe: 4
}

export default function CalendriersPage() {
  const router = useRouter()
  const [equipes, setEquipes] = useState<EquipeProgression[]>([])
  const [mesTournees, setMesTournees] = useState<MesTournees[]>([])
  // keep a local monStatut but derive from the typed tournee view when available
  const [monStatut, setMonStatut] = useState<MonStatut | null>(mockMonStatut)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | undefined>(undefined)

  // Use the typed hook which queries the v_sapeur_dashboard view for the current user
  const { tourneeActive, isLoading: tourneeLoading } = useTourneeData(userId)

  useEffect(() => {
    // Simulation chargement depuis Supabase for teams/history (kept mocked for now)
    setTimeout(() => {
      setEquipes(mockEquipes)
      setMesTournees(mockMesTournees)
      setLoading(false)
    }, 800)

    // fetch current user id from client supabase auth and let the hook refresh
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUserId(data?.user?.id ?? undefined)
      } catch (err) {
        // ignore - user may be not signed in in some dev flows
        console.debug('Could not get supabase user id', err)
      }
    })()
  }, [])

  // When the typed tournee row changes, derive the monStatut display values and
  // coalesce nullable numeric fields to safe defaults to avoid runtime NaN and TS errors.
  useEffect(() => {
    if (!tourneeActive) {
      setMonStatut(mockMonStatut)
      return
    }

    setMonStatut({
      tournee_active: true,
      calendriers_restants: tourneeActive.calendars_remaining ?? mockMonStatut.calendriers_restants,
      montant_total: tourneeActive.total_amount ?? mockMonStatut.montant_total,
      position_equipe: mockMonStatut.position_equipe,
      total_equipe: mockMonStatut.total_equipe,
    })
  }, [tourneeActive])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const maintenant = new Date()
    const diffHeures = Math.floor((maintenant.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHeures < 1) return "À l'instant"
    if (diffHeures < 24) return `Il y a ${diffHeures}h`
    const diffJours = Math.floor(diffHeures / 24)
    return `Il y a ${diffJours}j`
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">En cours</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Terminé</Badge>
      case 'paused':
        return <Badge variant="default" className="bg-orange-100 text-orange-800">Pause</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const totalObjectif = equipes.reduce((sum, equipe) => sum + equipe.calendriers_objectif, 0)
  const totalDistribue = equipes.reduce((sum, equipe) => sum + equipe.calendriers_distribues, 0)
  const totalMontant = equipes.reduce((sum, equipe) => sum + equipe.montant_collecte, 0)
  const progressionGlobale = totalObjectif > 0 ? (totalDistribue / totalObjectif) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tournées & Calendriers</h1>
                <p className="text-sm text-gray-600">Campagne 2024</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Distribués</p>
                  <p className="text-lg font-bold">{totalDistribue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Objectif</p>
                  <p className="text-lg font-bold">{totalObjectif}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Euro className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Collecté</p>
                  <p className="text-lg font-bold">{totalMontant}€</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Progression</p>
                  <p className="text-lg font-bold">{Math.round(progressionGlobale)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progression des équipes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Progression des équipes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipes.map((equipe) => {
              const progression = (equipe.calendriers_distribues / equipe.calendriers_objectif) * 100
              return (
                <div key={equipe.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: equipe.couleur }}
                      />
                      <span className="font-medium">{equipe.nom}</span>
                      {getStatutBadge(equipe.statut)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {equipe.calendriers_distribues}/{equipe.calendriers_objectif}
                      </p>
                      <p className="text-xs text-gray-500">
                        {equipe.montant_collecte}€
                      </p>
                    </div>
                  </div>
                  <Progress value={progression} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{equipe.sapeurs_actifs} sapeurs actifs</span>
                    <span>{formatDateTime(equipe.derniere_activite)}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Mon statut */}
        {monStatut && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Mon statut</span>
                </div>
                <div className="text-sm text-gray-500">
                  {monStatut.position_equipe}e/{monStatut.total_equipe} dans l&apos;équipe
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Calendriers restants</p>
                  <p className="text-2xl font-bold text-blue-600">{monStatut.calendriers_restants}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Euro className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Mon total</p>
                  <p className="text-2xl font-bold text-green-600">{monStatut.montant_total}€</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  {monStatut.tournee_active ? (
                    <>
                      <AlertCircle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className="text-sm font-bold text-orange-600">Tournée active</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className="text-sm font-bold text-gray-600">Disponible</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bouton principal */}
              <div className="text-center">
                {monStatut.tournee_active ? (
                  <Button 
                    onClick={() => router.push('/dashboard/ma-tournee')}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Continuer ma tournée
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push('/dashboard/ma-tournee')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Démarrer une tournée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historique de mes tournées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Mes dernières tournées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mesTournees.map((tournee) => (
                <div key={tournee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{formatDate(tournee.date)}</p>
                      <p className="text-sm text-gray-600">
                        {tournee.calendriers_distribues} calendriers
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tournee.montant}€</p>
                    <Badge variant="outline" className="text-xs">
                      Terminée
                    </Badge>
                  </div>
                </div>
              ))}
              
              {mesTournees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune tournée enregistrée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}