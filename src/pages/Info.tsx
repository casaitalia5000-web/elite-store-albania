import { UtensilsCrossed, Clock, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/supabase';
import type { Route } from '@/lib/router';

export function About({ navigate }: { route: Route; navigate: (to: string) => void }) {
  return (
    <div className="pt-20 sm:pt-24">
      <div className="bg-neutral-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Rreth Nesh</h1>
          <p className="text-neutral-400 mt-2 max-w-2xl">
            Elite Store Albania eshte dyqani online juaj me produkte te zgjedhura dhe sherbim te shpejte.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Historia jone</h2>
          <p className="text-neutral-600 leading-relaxed">
            Elite Store Albania ofron produkte te zgjedhura me cilësi te larte dhe cmime te arsyeshme.
            Perditesohemi cdo jave me produkte te reja, per t'ju ofruar gjithmone me te miren.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-video bg-neutral-100">
          <img src="https://images.pexels.com/photos/3017325/pexels-photo-3017325.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Kuzhina italiane" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}

export function Contact({ navigate }: { route: Route; navigate: (to: string) => void }) {
  const waUrl = `https://wa.me/355693079134?text=${encodeURIComponent('Pershendetje, do doja te pyesja per...')}`;
  return (
    <div className="pt-20 sm:pt-24">
      <div className="bg-neutral-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Kontakt</h1>
          <p className="text-neutral-400 mt-2">Jemi ketu per t'ju ndihmuar.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm text-center">
          <Phone className="w-6 h-6 text-red-700 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-900">Telefon / WhatsApp</h3>
          <p className="text-neutral-600 mt-1">{WHATSAPP_NUMBER}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm text-center">
          <Mail className="w-6 h-6 text-red-700 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-900">Email</h3>
          <p className="text-neutral-600 mt-1">casaitalia@gmail.com</p>
        </div>
        <div className="p-6 rounded-2xl bg-white border border-neutral-100 shadow-sm text-center">
          <Clock className="w-6 h-6 text-red-700 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-900">Orari</h3>
          <p className="text-neutral-600 mt-1">10:00 - 23:00 cdo dite</p>
        </div>
        <div className="sm:col-span-3 text-center mt-4">
          <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
            <MessageCircle className="w-5 h-5" /> Shkruani ne WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
