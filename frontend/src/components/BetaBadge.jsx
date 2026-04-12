import { Flame } from 'lucide-react';

export default function BetaBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-orange-500/30 transition-shadow">
      <Flame className="w-3.5 h-3.5" />
      <span>BETA</span>
    </div>
  );
}
