export const colombiaLocations: Record<string, string[]> = {
  'Antioquia': ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Rionegro', 'Apartadó'],
  'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
  'Bogotá D.C.': ['Bogotá D.C.'],
  'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona'],
  'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá'],
  'Caldas': ['Manizales', 'La Dorada', 'Villamaría', 'Chinchiná'],
  'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'],
  'Cesar': ['Valledupar', 'Aguachica', 'Agustín Codazzi'],
  'Córdoba': ['Montería', 'Lorica', 'Cereté', 'Sahagún'],
  'Cundinamarca': ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Fusagasugá'],
  'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
  'La Guajira': ['Riohacha', 'Maicao', 'Uribia'],
  'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
  'Meta': ['Villavicencio', 'Acacías', 'Granada'],
  'Nariño': ['Pasto', 'Tumaco', 'Ipiales'],
  'Norte de Santander': ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Pamplona'],
  'Quindío': ['Armenia', 'Calarcá', 'Montenegro'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Barrancabermeja', 'Piedecuesta', 'Girón'],
  'Sucre': ['Sincelejo', 'Corozal', 'San Marcos'],
  'Tolima': ['Ibagué', 'Espinal', 'Melgar'],
  'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Yumbo', 'Cartago', 'Buga']
};

export const departments = Object.keys(colombiaLocations).sort();
