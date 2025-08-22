import { Eyewear1 } from "@/components/icons/eyewear-1";
import { Eyewear2 } from "@/components/icons/eyewear-2";
import { Eyewear3 } from "@/components/icons/eyewear-3";
import { Eyewear4 } from "@/components/icons/eyewear-4";
import { Eyewear5 } from "@/components/icons/eyewear-5";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eyewear = [
  { id: 1, component: Eyewear1, name: "Eyewear 1" },
  { id: 2, component: Eyewear2, name: "Eyewear 2" },
  { id: 3, component: Eyewear3, name: "Eyewear 3" },
  { id: 4, component: Eyewear4, name: "Eyewear 4" },
  { id: 5, component: Eyewear5, name: "Eyewear 5" },
];

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel - Eyewear Assets</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {eyewear.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center text-lg">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-4">
                <item.component className="h-32 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
