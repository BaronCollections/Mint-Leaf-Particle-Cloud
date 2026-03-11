import React, { useState } from 'react';
import MintParticleCloud, { CloudState } from './components/MintParticleCloud';
import { Activity, Brain, ShieldAlert } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<CloudState>('idle');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-16">
        
        {/* Left side: Controls and Info */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-emerald-400 mb-2">Xiaoya <span className="text-zinc-500 text-2xl ml-2">小雅</span></h1>
            <p className="text-zinc-400 text-lg">The Mint-Leaf Particle Cloud</p>
          </div>

          <div className="space-y-4">
            <p className="text-zinc-300 leading-relaxed">
              Xiaoya is not a rigid robot avatar, but a <strong>"breathing energy body"</strong>.
              Her form is composed of thousands of tiny "life particles" gathered into a mint leaf shape,
              with edges that glow softly like mist.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setState('idle')}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                state === 'idle' 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Activity className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium text-lg">Idle (常态)</div>
                <div className="text-sm opacity-70">Brownian motion, slow breathing</div>
              </div>
            </button>

            <button
              onClick={() => setState('thinking')}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                state === 'thinking' 
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <Brain className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium text-lg">Thinking (思考态)</div>
                <div className="text-sm opacity-70">Accelerated rotation, dense bit core</div>
              </div>
            </button>

            <button
              onClick={() => setState('alert')}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                state === 'alert' 
                  ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium text-lg">Alert (警示态)</div>
                <div className="text-sm opacity-70">Pale orange transition, vibration feedback</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right side: The Particle Cloud */}
        <div className="flex-1 flex items-center justify-center relative min-h-[500px]">
          {/* Subtle background grid for contrast */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          
          <div className="relative w-[450px] h-[450px] flex items-center justify-center">
            <MintParticleCloud state={state} size={450} />
          </div>
        </div>

      </div>
    </div>
  );
}
