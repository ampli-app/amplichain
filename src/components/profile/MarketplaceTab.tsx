
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingBag, Briefcase, Headphones, Plus, ExternalLink, Pencil } from 'lucide-react';
import { Product, Service, Consultation } from '@/types/messages';

interface MarketplaceTabProps {
  userProducts: Product[];
  userServices: Service[];
  userConsultations: Consultation[];
  handleDeleteProduct: (id: string) => Promise<void>;
  handleDeleteService: (id: string) => Promise<void>;
  handleDeleteConsultation: (id: string) => Promise<void>;
}

export function MarketplaceTab({ 
  userProducts, 
  userServices, 
  userConsultations,
  handleDeleteProduct,
  handleDeleteService,
  handleDeleteConsultation
}: MarketplaceTabProps) {
  const navigate = useNavigate();
  const [marketplaceTab, setMarketplaceTab] = useState("products");
  
  const loadProductForEditing = (productId: string) => {
    navigate(`/edit-product/${productId}`);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Mój Marketplace</h2>
        <Button
          onClick={() => navigate('/marketplace')}
          className="gap-2"
        >
          <Store className="h-4 w-4" />
          Przejdź do Marketplace
        </Button>
      </div>
      
      <Tabs value={marketplaceTab} onValueChange={setMarketplaceTab} className="mb-6">
        <TabsList className="mb-4 grid grid-cols-3 max-w-md">
          <TabsTrigger value="products" className="flex gap-2 items-center">
            <ShoppingBag className="h-4 w-4" />
            Produkty ({userProducts.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="flex gap-2 items-center">
            <Briefcase className="h-4 w-4" />
            Usługi ({userServices.length})
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex gap-2 items-center">
            <Headphones className="h-4 w-4" />
            Konsultacje ({userConsultations.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-medium">Moje Produkty</h3>
            <Button size="sm" onClick={() => navigate('/marketplace')}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj produkt
            </Button>
          </div>
          
          {userProducts.length > 0 ? (
            <div className="space-y-4">
              {userProducts.map((product) => (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{product.title}</CardTitle>
                      <div className="text-lg font-semibold">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN'
                        }).format(product.price)}
                      </div>
                    </div>
                    <CardDescription>
                      Dodano: {new Date(product.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {product.description && (
                      <p className="mb-4 text-muted-foreground line-clamp-2">{product.description}</p>
                    )}
                    {product.category && <Badge className="mr-2">{product.category}</Badge>}
                  </CardContent>
                  <div className="flex justify-end p-4 pt-0 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/marketplace/${product.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Zobacz
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => loadProductForEditing(product.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium">Nie masz jeszcze żadnych produktów</h3>
              <p className="text-muted-foreground mb-4">Dodaj swój pierwszy produkt do Marketplace.</p>
              <Button onClick={() => navigate('/marketplace')}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj produkt
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="services">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-medium">Moje Usługi</h3>
            <Button size="sm" onClick={() => navigate('/marketplace?tab=services')}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj usługę
            </Button>
          </div>
          
          {userServices.length > 0 ? (
            <div className="space-y-4">
              {userServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{service.title}</CardTitle>
                      <div className="text-lg font-semibold">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN'
                        }).format(service.price)}
                      </div>
                    </div>
                    <CardDescription>
                      Dodano: {new Date(service.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="mb-4 text-muted-foreground line-clamp-2">{service.description}</p>
                    )}
                    {service.category && <Badge className="mr-2">{service.category}</Badge>}
                  </CardContent>
                  <div className="flex justify-end p-4 pt-0 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/services/${service.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Zobacz
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/edit-service/${service.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium">Nie masz jeszcze żadnych usług</h3>
              <p className="text-muted-foreground mb-4">Dodaj swoją pierwszą usługę do Marketplace.</p>
              <Button onClick={() => navigate('/marketplace?tab=services')}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj usługę
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="consultations">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-medium">Moje Konsultacje</h3>
            <Button size="sm" onClick={() => navigate('/marketplace?tab=consultations')}>
              <Plus className="h-4 w-4 mr-1" />
              Dodaj konsultację
            </Button>
          </div>
          
          {userConsultations.length > 0 ? (
            <div className="space-y-4">
              {userConsultations.map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{consultation.title}</CardTitle>
                      <div className="text-lg font-semibold">
                        {new Intl.NumberFormat('pl-PL', {
                          style: 'currency',
                          currency: 'PLN'
                        }).format(consultation.price)}
                      </div>
                    </div>
                    <CardDescription>
                      Dodano: {new Date(consultation.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {consultation.description && (
                      <p className="mb-4 text-muted-foreground line-clamp-2">{consultation.description}</p>
                    )}
                    {consultation.categories && consultation.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {consultation.categories.map((category, idx) => (
                          <Badge key={idx} className="mr-2">{category}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <div className="flex justify-end p-4 pt-0 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/consultations/${consultation.id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Zobacz
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => navigate(`/edit-consultation/${consultation.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteConsultation(consultation.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <Headphones className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium">Nie masz jeszcze żadnych konsultacji</h3>
              <p className="text-muted-foreground mb-4">Dodaj swoją pierwszą ofertę konsultacji do Marketplace.</p>
              <Button onClick={() => navigate('/marketplace?tab=consultations')}>
                <Plus className="h-4 w-4 mr-1" />
                Dodaj konsultację
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
