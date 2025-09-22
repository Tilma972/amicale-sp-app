'use client'

import { useEffect,useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Briefcase,
  Car,
  Clock, 
  Copy,
  Dumbbell,
  ExternalLink,
  Eye,
  Filter,
  Gift,
  Globe, 
  Heart,
  Home,
  MapPin, 
  Percent,
  Phone, 
  Search,
  Share, 
  ShoppingBag,
  Star, 
  Store,
  Tag, 
  Utensils} from 'lucide-react'

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
import { createClient } from '@supabase/supabase-js'

interface Partenaire {
  id: string
  nom: string
  description: string
  logo_url?: string
  secteur: 'restaurant' | 'loisirs' | 'automobile' | 'equipement' | 'services' | 'commerce'
  adresse: string
  ville: string
  telephone?: string
  site_web?: string
  note_moyenne: number
  nombre_avis: number
  partenaire_depuis: string
}

interface OffreAvantage {
  id: string
  partenaire_id: string
  partenaire_nom: string
  titre: string
  description: string
  type_avantage: 'reduction' | 'offre_speciale' | 'cadeau' | 'service'
  valeur_reduction?: number
  code_promo?: string
  conditions: string
  valide_jusqu: string
  secteur: string
  populaire: boolean
  nombre_utilisations: number
  limite_utilisations?: number
}

// Données mock
const mockPartenaires: Partenaire[] = [
  {
    id: '1',
    nom: 'Restaurant Le Sapeur',
    description: 'Restaurant traditionnel français, spécialités du terroir',
    secteur: 'restaurant',
    adresse: '12 rue de la Caserne',
    ville: 'Clermont-l\'Hérault',
    telephone: '04.67.88.XX.XX',
    site_web: 'https://restaurant-lesapeur.fr',
    note_moyenne: 4.5,
    nombre_avis: 28,
    partenaire_depuis: '2022-03-15'
  },
  {
    id: '2',
    nom: 'Garage Martin Auto',
    description: 'Entretien et réparation automobile, véhicules toutes marques',
    secteur: 'automobile',
    adresse: 'Zone Artisanale Sud',
    ville: 'Clermont-l\'Hérault',
    telephone: '04.67.88.YY.YY',
    note_moyenne: 4.2,
    nombre_avis: 15,
    partenaire_depuis: '2023-01-10'
  },
  {
    id: '3',
    nom: 'Sport Plus',
    description: 'Magasin d\'équipements sportifs et fitness',
    secteur: 'loisirs',
    adresse: '45 avenue de la République',
    ville: 'Clermont-l\'Hérault',
    site_web: 'https://sportplus34.fr',
    note_moyenne: 4.8,
    nombre_avis: 42,
    partenaire_depuis: '2021-09-20'
  }
]

const mockOffres: OffreAvantage[] = [
  {
    id: '1',
    partenaire_id: '1',
    partenaire_nom: 'Restaurant Le Sapeur',
    titre: '-20% sur tous les repas',
    description: 'Remise de 20% sur l\'ensemble de la carte, valable midi et soir',
    type_avantage: 'reduction',
    valeur_reduction: 20,
    code_promo: 'SAPEUR20',
    conditions: 'Sur présentation de la carte professionnel SP. Non cumulable.',
    valide_jusqu: '2024-12-31',
    secteur: 'restaurant',
    populaire: true,
    nombre_utilisations: 47
  },
  {
    id: '2',
    partenaire_id: '2',
    partenaire_nom: 'Garage Martin Auto',
    titre: 'Vidange offerte',
    description: 'Vidange gratuite pour tout entretien de plus de 100€',
    type_avantage: 'offre_speciale',
    conditions: 'Valable uniquement sur RDV. Huile standard incluse.',
    valide_jusqu: '2024-06-30',
    secteur: 'automobile',
    populaire: false,
    nombre_utilisations: 12
  },
  {
    id: '3',
    partenaire_id: '3',
    partenaire_nom: 'Sport Plus',
    titre: '-15% équipements fitness',
    description: 'Réduction sur tout l\'équipement fitness et musculation',
    type_avantage: 'reduction',
    valeur_reduction: 15,
    code_promo: 'FITNESS15',
    conditions: 'Valable en magasin et sur le site web',
    valide_jusqu: '2024-03-31',
    secteur: 'loisirs',
    populaire: true,
    nombre_utilisations: 23
  },
  {
    id: '4',
    partenaire_id: '1',
    partenaire_nom: 'Restaurant Le Sapeur',
    titre: 'Menu découverte 25€',
    description: 'Menu 3 services avec vin inclus, spécialement conçu pour les SP',
    type_avantage: 'offre_speciale',
    conditions: 'Réservation obligatoire. Valable du mardi au samedi.',
    valide_jusqu: '2024-04-30',
    secteur: 'restaurant',
    populaire: false,
    nombre_utilisations: 8
  }
]

export default function PartenairesAvantagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSecteur, setSelectedSecteur] = useState<string>('all')
  const [showOffreModal, setShowOffreModal] = useState<string | null>(null)
  
  // États pour les données
  const [partenaires, setPartenaires] = useState<Partenaire[]>([])
  const [offres, setOffres] = useState<OffreAvantage[]>([])

  const secteurs = [
    { value: 'all', label: 'Tous', icon: Store },
    { value: 'restaurant', label: 'Restaurants', icon: Utensils },
    { value: 'automobile', label: 'Auto/Moto', icon: Car },
    { value: 'loisirs', label: 'Loisirs', icon: Dumbbell },
    { value: 'equipement', label: 'Équipement', icon: ShoppingBag },
    { value: 'services', label: 'Services', icon: Briefcase },
    { value: 'commerce', label: 'Commerce', icon: Store }
  ]

  useEffect(() => {
    // Simulation chargement depuis Supabase
    setTimeout(() => {
      setPartenaires(mockPartenaires)
      setOffres(mockOffres)
      setLoading(false)
    }, 800)
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (dateStr: string) => {
    const date = new Date(dateStr)
    const maintenant = new Date()
    const diffMs = date.getTime() - maintenant.getTime()
    const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffJours
  }

  const getTypeAvantageColor = (type: string) => {
    switch (type) {
      case 'reduction': return 'bg-green-100 text-green-800'
      case 'offre_speciale': return 'bg-blue-100 text-blue-800'
      case 'cadeau': return 'bg-purple-100 text-purple-800'
      case 'service': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeAvantageLabel = (type: string) => {
    switch (type) {
      case 'reduction': return 'Réduction'
      case 'offre_speciale': return 'Offre spéciale'
      case 'cadeau': return 'Cadeau'
      case 'service': return 'Service'
      default: return type
    }
  }

  const getSecteurIcon = (secteur: string) => {
    const secteurInfo = secteurs.find(s => s.value === secteur)
    if (secteurInfo) {
      const Icon = secteurInfo.icon
      return <Icon className="w-4 h-4" />
    }
    return <Store className="w-4 h-4" />
  }

  const offresFiltered = offres.filter(offre => {
    const matchSearch = offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       offre.partenaire_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       offre.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSecteur = selectedSecteur === 'all' || offre.secteur === selectedSecteur
    return matchSearch && matchSecteur
  })

  const handleCopyCode = (code?: string) => {
    if (!code) return
    navigator.clipboard.writeText(code)
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = `Code ${code} copié !`
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 2000)
  }

  const handleUtiliserOffre = (offreId: string) => {
    setOffres(prev => prev.map(offre => 
      offre.id === offreId 
        ? { ...offre, nombre_utilisations: offre.nombre_utilisations + 1 }
        : offre
    ))
    
    setShowOffreModal(null)
    
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.textContent = 'Offre marquée comme utilisée !'
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des avantages...</p>
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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Partenaires & Avantages</h1>
                <p className="text-sm text-gray-600">Offres exclusives pour les sapeurs-pompiers</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {partenaires.length} partenaires
            </Badge>
          </div>
        </div>
      </header>

      {/* Barre de recherche et filtres */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher une offre, un partenaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres secteurs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {secteurs.map((secteur) => {
              const Icon = secteur.icon
              return (
                <button
                  key={secteur.value}
                  onClick={() => setSelectedSecteur(secteur.value)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSecteur === secteur.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{secteur.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{offresFiltered.length} offre{offresFiltered.length > 1 ? 's' : ''} disponible{offresFiltered.length > 1 ? 's' : ''}</span>
          <div className="flex items-center space-x-1">
            <Gift className="w-4 h-4 text-blue-600" />
            <span>Avantages exclusifs SP</span>
          </div>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offresFiltered.map((offre) => {
            const daysRemaining = getDaysRemaining(offre.valide_jusqu)
            const partenaire = partenaires.find(p => p.id === offre.partenaire_id)
            
            return (
              <Card key={offre.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header offre */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getSecteurIcon(offre.secteur)}
                        <span className="text-sm text-gray-600">{offre.partenaire_nom}</span>
                        {offre.populaire && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Star className="w-3 h-3 mr-1" />
                            Populaire
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">{offre.titre}</CardTitle>
                    </div>
                    <Badge className={getTypeAvantageColor(offre.type_avantage)}>
                      {getTypeAvantageLabel(offre.type_avantage)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Valeur de l'avantage */}
                  {offre.valeur_reduction && (
                    <div className="text-center bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Percent className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-700">-{offre.valeur_reduction}%</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-700 text-sm">{offre.description}</p>

                  {/* Code promo */}
                  {offre.code_promo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Code promo</p>
                          <p className="text-lg font-bold text-blue-700">{offre.code_promo}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyCode(offre.code_promo)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Infos pratiques */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span>{offre.nombre_utilisations} utilisée{offre.nombre_utilisations > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {partenaire?.ville && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{partenaire.ville}</span>
                      </div>
                    )}
                  </div>

                  {/* Urgence */}
                  {daysRemaining <= 7 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                      <p className="text-xs text-orange-700 font-medium">
                        ⚡ Expire bientôt ! Plus que {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Bouton d'action */}
                  <Button
                    onClick={() => setShowOffreModal(offre.id)}
                    className="w-full"
                    variant={daysRemaining <= 7 ? "default" : "outline"}
                  >
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {offresFiltered.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {/* Modal Détails Offre */}
      {showOffreModal && (
        <Dialog open={!!showOffreModal} onOpenChange={() => setShowOffreModal(null)}>
          <DialogContent className="max-w-md">
            {(() => {
              const offre = offres.find(o => o.id === showOffreModal)
              const partenaire = partenaires.find(p => p.id === offre?.partenaire_id)
              if (!offre) return null

              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{offre.titre}</DialogTitle>
                    <DialogDescription>
                      {offre.partenaire_nom}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* Description complète */}
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-700">{offre.description}</p>
                    </div>

                    {/* Code promo */}
                    {offre.code_promo && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-blue-800">Code à utiliser</h4>
                          <Button
                            size="sm"
                            onClick={() => handleCopyCode(offre.code_promo)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copier
                          </Button>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 text-center bg-white rounded p-2">
                          {offre.code_promo}
                        </p>
                      </div>
                    )}

                    {/* Conditions */}
                    <div>
                      <h4 className="font-medium mb-2">Conditions</h4>
                      <p className="text-sm text-gray-600">{offre.conditions}</p>
                    </div>

                    {/* Infos partenaire */}
                    {partenaire && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium mb-2">Informations partenaire</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{partenaire.adresse}, {partenaire.ville}</span>
                          </div>
                          {partenaire.telephone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span>{partenaire.telephone}</span>
                            </div>
                          )}
                          {partenaire.site_web && (
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-gray-500" />
                              <a 
                                href={partenaire.site_web} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Site web
                              </a>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{partenaire.note_moyenne}/5 ({partenaire.nombre_avis} avis)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Validité */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Valide jusqu&apos;au</span>
                        <span className="font-medium">{formatDate(offre.valide_jusqu)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowOffreModal(null)}
                        className="flex-1"
                      >
                        Fermer
                      </Button>
                      <Button 
                        onClick={() => handleUtiliserOffre(offre.id)}
                        className="flex-1"
                      >
                        J&apos;ai utilisé cette offre
                      </Button>
                    </div>
                  </div>
                </>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}