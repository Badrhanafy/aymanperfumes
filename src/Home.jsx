import { Link } from 'react-router-dom';
import Reviews from './Reviews';
import Contact from './Contact';
import ProductScrollRow from './ProductScrollRow';

export const PRODUCTS = [
  { 
    id: 1, 
    name: "Le male Essence", 
    price: "$120", 
    note: "Woody", 
    img: "./lemale.jpg",
    slug: "le-male-essence"
  },
  { 
    id: 2, 
    name: "Sauvage Essence", 
    price: "$95", 
    note: "Fresh", 
    img: "./sauvage.avif",
    slug: "sauvage-essence"
  },
  { 
    id: 3, 
    name: "Silk Jasmine", 
    price: "$110", 
    note: "Floral", 
    img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=1200&auto=format&fit=crop",
    slug: "silk-jasmine"
  },
];

export default function ProductGrid() {
  return (
    <>
      <div className="relative w-full pt-[72px] md:pt-[88px] bg-white overflow-hidden">
        <img src="./banner.png" className="w-full h-auto block m-0 p-0 border-none" alt="L'Essence Banner" />
      </div>
      <ProductScrollRow />
      <Reviews />
      <Contact />
    </>
  );
}