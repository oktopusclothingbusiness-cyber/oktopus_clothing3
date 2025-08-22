import { Eyewear1 } from '@/components/icons/eyewear-1';
import { Eyewear2 } from '@/components/icons/eyewear-2';
import { Eyewear3 } from '@/components/icons/eyewear-3';
import { Eyewear4 } from '@/components/icons/eyewear-4';
import { Eyewear5 } from '@/components/icons/eyewear-5';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const images = [
    { id: 1, component: Eyewear1 },
    { id: 2, component: Eyewear2 },
    { id: 3, component: Eyewear3 },
    { id: 4, component: Eyewear4 },
    { id: 5, component: Eyewear5 },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel - Product Images</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {images.map(({ id, component: Icon }) => (
          <Card key={id}>
            <CardHeader>
              <CardTitle>Image {id}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-4">
              <Icon className="w-full h-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
