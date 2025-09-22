 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Euro,
  Eye,
  MapPin,
  Plus,
  Receipt,
  StopCircle,
  Target,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react'

import ClotureModal from '@/components/ClotureModal'
import ExistingDonForm from '@/components/ExistingDonForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/contexts/AppContext'
import { supabase } from '@/lib/supabase'

interface TourneeActive {
  id: string
  debut: string
  calendriers_initial: number
  calendriers_distribues: number
  calendriers_restants: number
  montant_collecte: number
  nb_transactions: number
  derniere_transaction: string | null
  statut: 'en_cours' | 'pause'
}

interface Transaction {
  id: string
  montant: number
  calendriers: number
  type_paiement: 'especes' | 'cheque' | 'carte'
  heure: string
  donateur?: string
  notes?: string
}

// Données mock
const mockTourneeActive: TourneeActive = {
  id: 'tournee_123',
  debut: '2024-01-15T09:00:00Z',
  calendriers_initial: 50,
  calendriers_distribues: 23,
  calendriers_restants: 27,
  montant_collecte: 230,
  nb_transactions: 12,
  derniere_transaction: '2024-01-15T14:30:00Z',
  statut: 'en_cours'
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    montant: 20,
    calendriers: 2,
    type_paiement: 'especes',
    heure: '14:30',
    donateur: 'Mme Martin'
  },
  {
    id: '2',
    montant: 30,
    calendriers: 3,
    type_paiement: 'cheque',
    heure: '14:15',
    donateur: 'M. Dubois'
  },
  {
    id: '3',
    montant: 10,
    calendriers: 1,
    type_paiement: 'especes',
    heure: '14:00'
  },
  {
    id: '4',
    montant: 15,
    calendriers: 1,
    type_paiement: 'carte',
    heure: '13:45'
  }
]

export default function MaTourneePage() {
  const router = useRouter()
  const { user, isOnline } = useApp()
  const [tournee, setTournee] = useState<TourneeActive | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [lastPending, setLastPending] = useState<{ amount: number; calendars_given: number; tempId?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDonModal, setShowDonModal] = useState(false)
  const [showClotureModal, setShowClotureModal] = useState(false)

  useEffect(() => {
    // Simulation chargement depuis Supabase
    setTimeout(() => {
      setTournee(mockTourneeActive)
      setTransactions(mockTransactions)
      setLoading(false)
    }, 500)
  }, [])

  const dureeDepuis = (debut: string) => {
    const maintenant = new Date()
    const start = new Date(debut)
    const diffMs = maintenant.getTime() - start.getTime()
    const heures = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (heures > 0) {
      return `${heures}h${minutes > 0 ? ` ${minutes}min` : ''}`
    }
    return `${minutes}min`
  }

  const moyenneParCalendrier = tournee ? 
    tournee.calendriers_distribues > 0 ? 
      Math.round(tournee.montant_collecte / tournee.calendriers_distribues) 
      : 0 
    : 0

  const progressionCalendriers = tournee ? 
    (tournee.calendriers_distribues / tournee.calendriers_initial) * 100 
    : 0

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'especes': return <Banknote className="w-4 h-4 text-green-600" />
      case 'cheque': return <Receipt className="w-4 h-4 text-blue-600" />
      case 'carte': return <CreditCard className="w-4 h-4 text-purple-600" />
      default: return <Euro className="w-4 h-4 text-gray-600" />
    }
  }

  const getPaymentColor = (type: string) => {
    switch (type) {
      case 'especes': return 'bg-green-100 text-green-800'
      case 'cheque': return 'bg-blue-100 text-blue-800' 
      case 'carte': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateTourneeOptimistic = (data: { amount: number; calendars_given: number }) => {
    // store last pending data so parent can persist it when form signals success
    const tempId = `pending_${Date.now()}`
    setLastPending({ ...data, tempId })

    // optimistic tournee update
    setTournee((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        montant_collecte: prev.montant_collecte + data.amount,
        calendriers_distribues: prev.calendriers_distribues + data.calendars_given,
        calendriers_restants: Math.max(0, prev.calendriers_restants - data.calendars_given),
        nb_transactions: prev.nb_transactions + 1,
      }
    })

    // prepend a temporary transaction in the list for immediate UX feedback
    const now = new Date()
    const tempTxn: Transaction = {
      id: tempId,
      montant: data.amount,
      calendriers: data.calendars_given,
      type_paiement: 'especes',
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setTransactions((prev) => [tempTxn, ...prev])
  }

  const insertTransactionFromPending = async (pending: { amount: number; calendars_given: number; tempId?: string }) => {
    if (!pending || !tournee?.id) return
    try {
      const payload: any = {
        amount: pending.amount,
        calendars_given: pending.calendars_given,
        payment_method: 'especes',
        donator_name: null,
        donator_email: null,
        notes: null,
        tournee_id: tournee.id,
        team_id: null,
        user_id: user?.id ?? null,
      }

      const { data: inserted, error } = await supabase
        .from('transactions')
        .insert(payload as any)
        .select()
        .single()

      if (error || !inserted) {
        console.error('Erreur insertion transaction depuis parent', error)
        return
      }

      const i: any = inserted as any
      const mapped: Transaction = {
        id: i.id ?? `tx_${Date.now()}`,
        montant: i.amount ?? pending.amount,
        calendriers: i.calendars_given ?? pending.calendars_given,
        type_paiement: (i.payment_method ?? 'especes') as Transaction['type_paiement'],
        heure: i.created_at ? new Date(i.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        donateur: i.donator_name ?? undefined,
        notes: i.notes ?? undefined,
      }

      // replace temporary transaction (if present) or prepend
      setTransactions(prev => {
        if (pending.tempId) {
          return prev.map(t => t.id === pending.tempId ? mapped : t)
        }
        return [mapped, ...prev]
      })

      // sync canonical tournee values
      await syncAfterOnlineSuccess()

    } catch (err) {
      console.error('insertTransactionFromPending error', err)
    } finally {
      setLastPending(null)
    }
  }

  const syncAfterOnlineSuccess = async () => {
    if (!tournee?.id) return
    try {
      // Try to refetch the tournee from the DB to get canonical values
      const { data: fetched, error } = await supabase
        .from('tournees')
        .select('id,debut,calendriers_initial,calendriers_distribues,calendriers_restants,montant_collecte,nb_transactions,derniere_transaction,status')
        .eq('id', tournee.id)
        .single()

      if (error || !fetched) {
        return
      }

      const data = fetched as any
      setTournee((prev) => ({
        id: data.id,
        debut: data.debut,
        calendriers_initial: data.calendriers_initial,
        calendriers_distribues: data.calendriers_distribues,
        calendriers_restants: data.calendriers_restants,
        montant_collecte: data.montant_collecte,
        nb_transactions: data.nb_transactions,
        derniere_transaction: data.derniere_transaction,
        statut: (data.status as any) ?? 'en_cours',
      }))
    } catch (err) {
      console.error('syncAfterOnlineSuccess error', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tournée...</p>
        </div>
      </div>
    )
  }

  if (!tournee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune tournée active</h2>
            <p className="text-gray-600 mb-4">Vous devez d&apos;abord démarrer une tournée</p>
            <Button onClick={() => router.push('/dashboard/calendriers')}>
              Retourner au tableau de bord
            </Button>
          </CardContent>
        </Card>
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ma Tournée</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Timer className="w-4 h-4" />
                  <span>En cours depuis {dureeDepuis(tournee.debut)}</span>
                  <Badge variant="default" className="bg-green-100 text-green-800 ml-2">
                    <Activity className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Compteurs principaux */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Distribués</p>
                  <p className="text-2xl font-bold text-blue-900">{tournee.calendriers_distribues}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Restants</p>
                  <p className="text-2xl font-bold text-orange-900">{tournee.calendriers_restants}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Collecté</p>
                  <p className="text-2xl font-bold text-green-900">{tournee.montant_collecte}€</p>
                </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Moyenne</p>
                  <p className="text-2xl font-bold text-purple-900">{moyenneParCalendrier}€</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progression */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progression de la tournée</span>
              <span className="text-sm font-normal text-gray-600">
                {Math.round(progressionCalendriers)}% terminé
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressionCalendriers} className="h-3 mb-4" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>0 calendriers</span>
              <span>{tournee.calendriers_initial} calendriers</span>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            onClick={() => setShowDonModal(true)}
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white h-16 text-lg font-semibold"
          >
            <Plus className="w-6 h-6 mr-2" />
            Enregistrer un don
          </Button>
          
          <Button 
            onClick={() => setShowClotureModal(true)}
            size="lg" 
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 h-16 text-lg font-semibold"
          >
            <StopCircle className="w-6 h-6 mr-2" />
            Terminer la tournée
          </Button>
        </div>

        {/* Dernières transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Dernières transactions</span>
              </div>
              <Badge variant="outline">
                {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getPaymentIcon(transaction.type_paiement)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {transaction.montant}€
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPaymentColor(transaction.type_paiement)}`}
                        >
                          {transaction.type_paiement}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.calendriers} calendrier{transaction.calendriers > 1 ? 's' : ''}
                        {transaction.donateur && ` • ${transaction.donateur}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{transaction.heure}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>Détails</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune transaction enregistrée</p>
                  <p className="text-sm">Commencez par enregistrer votre premier don</p>
                </div>
              )}
            </div>
            
            {transactions.length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm">
                  Voir toutes les transactions ({transactions.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Durée</p>
              <p className="text-lg font-semibold">{dureeDepuis(tournee.debut)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-lg font-semibold">{tournee.nb_transactions}</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1 col-span-2">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Dernière activité</p>
              <p className="text-lg font-semibold">
                {tournee.derniere_transaction ? 
                  new Date(tournee.derniere_transaction).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) 
                  : 'Aucune'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales (intégration ExistingDonForm et ClotureModal) */}
      {showDonModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
      <ExistingDonForm
        tourneeActive={{
          tournee_id: tournee?.id,
          team_id: undefined,
          team_name: undefined,
          team_color: undefined,
        }}
        onCancel={() => setShowDonModal(false)}
        onSuccess={() => {
          setShowDonModal(false)
          if (lastPending) {
            if (isOnline) {
              insertTransactionFromPending(lastPending)
            } else {
              setLastPending(null)
            }
          }
        }}
        updateTourneeOptimistic={updateTourneeOptimistic}
        syncAfterOnlineSuccess={syncAfterOnlineSuccess}
      />
    </div>
  </div>
)}

      {showClotureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Clôture de tournée</h3>
            <p className="text-gray-600 mb-4">
              Intégrer votre composant ClotureModal ici
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowClotureModal(false)}>
                Annuler
              </Button>
              <Button onClick={() => setShowClotureModal(false)}>
                Clôturer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}