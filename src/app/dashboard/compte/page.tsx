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
  Eye,
  FileText,
  PieChart,
  Plus,
  Settings,
  Target,
  TrendingUp, 
  Upload,
  Users, 
  Wallet,
  XCircle} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@supabase/supabase-js'

interface ComptePersonnel {
  user_id: string
  nom: string
  equipe: string
  solde_disponible: number
  total_distribue: number
  total_gagne: number
  pourcentage_pot_commun: number
  contribution_pot_commun: number
  derniere_activite: string
}

interface CompteEquipe {
  team_id: string
  nom_equipe: string
  pot_commun_total: number
  total_distribue_equipe: number
  nombre_membres: number
  objectif_campagne: number
  classement: number
}

interface DemandePaiement {
  id: string
  user_id: string
  type: 'personnel' | 'equipe'
  montant: number
  description: string
  justificatif_url?: string
  statut: 'en_attente' | 'approuve' | 'paye' | 'refuse'
  date_demande: string
  date_traitement?: string
  commentaire_admin?: string
}

interface Transaction {
  id: string
  type: 'gain' | 'contribution' | 'depense'
  montant: number
  description: string
  date: string
  tournee_id?: string
}

// Données mock
const mockComptePersonnel: ComptePersonnel = {
  user_id: 'user1',
  nom: 'Marc D.',
  equipe: 'Équipe Alpha',
  solde_disponible: 125.50,
  total_distribue: 740,
  total_gagne: 222,
  pourcentage_pot_commun: 35,
  contribution_pot_commun: 77.70,
  derniere_activite: '2024-01-15T14:30:00Z'
}

const mockCompteEquipe: CompteEquipe = {
  team_id: 'team1',
  nom_equipe: 'Équipe Alpha',
  pot_commun_total: 284.30,
  total_distribue_equipe: 2850,
  nombre_membres: 4,
  objectif_campagne: 3000,
  classement: 2
}

const mockDemandesPaiement: DemandePaiement[] = [
  {
    id: '1',
    user_id: 'user1',
    type: 'personnel',
    montant: 45.80,
    description: 'Restaurant Le Sapeur - Repas équipe',
    statut: 'approuve',
    date_demande: '2024-01-12T10:00:00Z',
    date_traitement: '2024-01-13T15:30:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    type: 'equipe',
    montant: 120,
    description: 'Sortie bowling équipe Alpha',
    statut: 'en_attente',
    date_demande: '2024-01-14T16:20:00Z'
  }
]

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'gain',
    montant: 23,
    description: 'Tournée du 15/01 - 23 calendriers',
    date: '2024-01-15T18:00:00Z',
    tournee_id: 'tournee_123'
  },
  {
    id: '2',
    type: 'contribution',
    montant: -8.05,
    description: 'Contribution pot commun (35%)',
    date: '2024-01-15T18:00:00Z'
  },
  {
    id: '3',
    type: 'depense',
    montant: -45.80,
    description: 'Restaurant Le Sapeur - Payé',
    date: '2024-01-13T15:30:00Z'
  }
]

export default function MonComptePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('compte')
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  
  // États pour les données
  const [comptePersonnel, setComptePersonnel] = useState<ComptePersonnel | null>(null)
  const [compteEquipe, setCompteEquipe] = useState<CompteEquipe | null>(null)
  const [demandesPaiement, setDemandesPaiement] = useState<DemandePaiement[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  // États pour nouvelle demande
  const [nouvelleDemande, setNouvelleDemande] = useState({
    type: 'personnel' as 'personnel' | 'equipe',
    montant: '',
    description: '',
    justificatif: null as File | null
  })
  
  // États pour configuration
  const [nouveauPourcentage, setNouveauPourcentage] = useState([35])

  useEffect(() => {
    // Simulation chargement depuis Supabase
    setTimeout(() => {
      setComptePersonnel(mockComptePersonnel)
      setCompteEquipe(mockCompteEquipe)
      setDemandesPaiement(mockDemandesPaiement)
      setTransactions(mockTransactions)
      setNouveauPourcentage([mockComptePersonnel.pourcentage_pot_commun])
      setLoading(false)
    }, 800)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-orange-100 text-orange-800'
      case 'approuve': return 'bg-green-100 text-green-800'
      case 'paye': return 'bg-blue-100 text-blue-800'
      case 'refuse': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente': return <Clock className="w-4 h-4" />
      case 'approuve': return <CheckCircle className="w-4 h-4" />
      case 'paye': return <CheckCircle className="w-4 h-4" />
      case 'refuse': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'gain': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'contribution': return <Users className="w-4 h-4 text-blue-600" />
      case 'depense': return <Euro className="w-4 h-4 text-red-600" />
      default: return <Euro className="w-4 h-4 text-gray-600" />
    }
  }

  const simulerNouveauSolde = () => {
    if (!comptePersonnel) return { personnel: 0, potCommun: 0 }
    
    const futursGains = comptePersonnel.total_gagne * (100 - nouveauPourcentage[0]) / 100
    const futureContribution = comptePersonnel.total_gagne * nouveauPourcentage[0] / 100
    
    return {
      personnel: futursGains,
      potCommun: futureContribution
    }
  }

  const handleSoumettredemande = () => {
    if (!nouvelleDemande.montant || !nouvelleDemande.description) return
    
    console.log('Nouvelle demande:', nouvelleDemande)
    setShowDemandeModal(false)
    setNouvelleDemande({ type: 'personnel', montant: '', description: '', justificatif: null })
    
    // Toast de confirmation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Demande envoyée !'
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }

  const handleSauvegarderPourcentage = () => {
    if (!comptePersonnel) return
    
    setComptePersonnel(prev => prev ? {
      ...prev,
      pourcentage_pot_commun: nouveauPourcentage[0]
    } : null)
    
    setShowConfigModal(false)
    
    // Toast de confirmation
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Configuration mise à jour !'
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }

  const progressionObjectif = compteEquipe ? 
    (compteEquipe.total_distribue_equipe / compteEquipe.objectif_campagne) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre compte...</p>
        </div>
      </div>
    )
  }

  if (!comptePersonnel || !compteEquipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Compte non disponible</h2>
            <p className="text-gray-600 mb-4">Impossible de charger les informations de compte</p>
            <Button onClick={() => router.back()}>
              Retour
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Compte SP</h1>
                <p className="text-sm text-gray-600">{comptePersonnel.nom} - {comptePersonnel.equipe}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfigModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <Button onClick={() => setShowDemandeModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Demande
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compte" className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Compte</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Équipe</span>
            </TabsTrigger>
            <TabsTrigger value="demandes" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Demandes</span>
            </TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Historique</span>
            </TabsTrigger>
          </TabsList>

          {/* Onglet Compte Personnel */}
          <TabsContent value="compte" className="space-y-6">
            {/* Solde principal */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-6 h-6 text-green-600" />
                    <span>Solde disponible</span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    Campagne 2024
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-green-700 mb-2">
                    {comptePersonnel.solde_disponible.toFixed(2)}€
                  </p>
                  <p className="text-green-600">
                    Utilisable pour vos activités personnelles
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total distribué</p>
                    <p className="text-xl font-semibold text-gray-900">{comptePersonnel.total_distribue}€</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Total gagné (30%)</p>
                    <p className="text-xl font-semibold text-gray-900">{comptePersonnel.total_gagne}€</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Contribution pot</p>
                    <p className="text-xl font-semibold text-gray-900">{comptePersonnel.contribution_pot_commun.toFixed(2)}€</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration contribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Répartition de vos gains</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contribution au pot commun</span>
                    <span className="text-lg font-semibold">{comptePersonnel.pourcentage_pot_commun}%</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Pot commun équipe</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {comptePersonnel.pourcentage_pot_commun}%
                      </p>
                      <p className="text-xs text-blue-600">
                        {(comptePersonnel.total_gagne * comptePersonnel.pourcentage_pot_commun / 100).toFixed(2)}€ contribués
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Wallet className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Personnel</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {100 - comptePersonnel.pourcentage_pot_commun}%
                      </p>
                      <p className="text-xs text-green-600">
                        {(comptePersonnel.total_gagne * (100 - comptePersonnel.pourcentage_pot_commun) / 100).toFixed(2)}€ disponibles
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfigModal(true)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Modifier la répartition
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Équipe */}
          <TabsContent value="equipe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span>{compteEquipe.nom_equipe}</span>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>{compteEquipe.classement}e place</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pot commun */}
                <div className="text-center bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Pot commun équipe</h3>
                  <p className="text-3xl font-bold text-blue-700 mb-1">
                    {compteEquipe.pot_commun_total.toFixed(2)}€
                  </p>
                  <p className="text-sm text-blue-600">
                    Disponible pour les activités collectives
                  </p>
                </div>

                {/* Progression objectif */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progression campagne</span>
                    <span className="text-sm text-gray-600">
                      {compteEquipe.total_distribue_equipe}€ / {compteEquipe.objectif_campagne}€
                    </span>
                  </div>
                  <Progress value={progressionObjectif} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(progressionObjectif)}% de l&apos;objectif atteint
                  </p>
                </div>

                {/* Stats équipe */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Membres actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{compteEquipe.nombre_membres}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Moyenne/membre</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(compteEquipe.total_distribue_equipe / compteEquipe.nombre_membres)}€
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Demandes */}
          <TabsContent value="demandes" className="space-y-4">
            {demandesPaiement.map((demande) => (
              <Card key={demande.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{demande.description}</h3>
                        <Badge variant="outline" className={getStatutColor(demande.statut)}>
                          {getStatutIcon(demande.statut)}
                          <span className="ml-1 capitalize">{demande.statut.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Type: {demande.type === 'personnel' ? 'Personnel' : 'Équipe'} • 
                        Demandé le {formatDate(demande.date_demande)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{demande.montant}€</p>
                    </div>
                  </div>
                  
                  {demande.date_traitement && (
                    <p className="text-xs text-gray-500">
                      Traité le {formatDate(demande.date_traitement)}
                    </p>
                  )}
                  
                  {demande.commentaire_admin && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Commentaire:</strong> {demande.commentaire_admin}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {demandesPaiement.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
                <p className="text-gray-600 mb-4">Vous n&apos;avez pas encore fait de demande de paiement</p>
                <Button onClick={() => setShowDemandeModal(true)}>
                  Faire une demande
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="historique" className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.montant > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.montant > 0 ? '+' : ''}{transaction.montant}€
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Nouvelle Demande */}
      {showDemandeModal && (
        <Dialog open={showDemandeModal} onOpenChange={setShowDemandeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de paiement</DialogTitle>
              <DialogDescription>
                Demandez un paiement depuis votre solde disponible
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type de demande</label>
                <select 
                  value={nouvelleDemande.type}
                  onChange={(e) => setNouvelleDemande(prev => ({...prev, type: e.target.value as 'personnel' | 'equipe'}))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="personnel">Personnel ({comptePersonnel.solde_disponible.toFixed(2)}€ disponibles)</option>
                  <option value="equipe">Équipe ({compteEquipe.pot_commun_total.toFixed(2)}€ disponibles)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Montant</label>
                <Input
                  type="number"
                  step="0.01"
                  value={nouvelleDemande.montant}
                  onChange={(e) => setNouvelleDemande(prev => ({...prev, montant: e.target.value}))}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={nouvelleDemande.description}
                  onChange={(e) => setNouvelleDemande(prev => ({...prev, description: e.target.value}))}
                  placeholder="Restaurant, sortie, activité..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Justificatif (optionnel)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Devis, facture, bon de commande...</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setNouvelleDemande(prev => ({...prev, justificatif: e.target.files?.[0] || null}))}
                    className="hidden"
                    id="justificatif-upload"
                  />
                  <label htmlFor="justificatif-upload">
                    <Button variant="outline" size="sm" className="mt-2 cursor-pointer">
                      Choisir un fichier
                    </Button>
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowDemandeModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={handleSoumettredemande}
                  disabled={!nouvelleDemande.montant || !nouvelleDemande.description}
                  className="flex-1"
                >
                  Soumettre
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Configuration Pourcentage */}
      {showConfigModal && (
        <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configuration de la répartition</DialogTitle>
              <DialogDescription>
                Définissez votre contribution au pot commun équipe
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Configuration de campagne
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Cette répartition s&apos;applique à tous vos gains de la campagne calendriers 2024. 
                      Modifiable jusqu&apos;à la clôture de la campagne.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium">Contribution pot commun</label>
                    <span className="text-2xl font-bold text-blue-600">{nouveauPourcentage[0]}%</span>
                  </div>
                  
                  <Slider
                    value={nouveauPourcentage}
                    onValueChange={setNouveauPourcentage}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-4"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0% (tout personnel)</span>
                    <span>100% (tout partagé)</span>
                  </div>
                </div>

                {/* Simulation en temps réel */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Simulation sur vos gains actuels ({comptePersonnel.total_gagne}€)</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-100 border border-green-200 rounded p-3 text-center">
                      <p className="text-xs text-green-700">Solde personnel</p>
                      <p className="text-lg font-bold text-green-800">
                        {(comptePersonnel.total_gagne * (100 - nouveauPourcentage[0]) / 100).toFixed(2)}€
                      </p>
                    </div>
                    
                    <div className="bg-blue-100 border border-blue-200 rounded p-3 text-center">
                      <p className="text-xs text-blue-700">Contribution équipe</p>
                      <p className="text-lg font-bold text-blue-800">
                        {(comptePersonnel.total_gagne * nouveauPourcentage[0] / 100).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Suggestions :</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[20, 35, 50].map(percentage => (
                      <button
                        key={percentage}
                        onClick={() => setNouveauPourcentage([percentage])}
                        className={`p-2 text-xs border rounded transition-colors ${
                          nouveauPourcentage[0] === percentage
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowConfigModal(false)} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={handleSauvegarderPourcentage}
                  className="flex-1"
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}