import { Smartphone, Star, Download, Shield, ChevronRight, Share2, BookmarkPlus } from 'lucide-react';

export default function PhonePreview({ title, shortDesc, fullDesc, iconUrl, featureGraphic, screenshots = [] }) {
  return (
    <div className="sticky top-8">
      {/* Phone Shell */}
      <div className="relative mx-auto scale-[0.85] sm:scale-100 origin-top" style={{ width: '300px' }}>
        {/* Outer frame */}
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[2.8rem] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
          {/* Inner bezel */}
          <div className="bg-black rounded-[2.2rem] p-[3px] relative">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-black rounded-b-2xl px-6 py-0" style={{ width: '120px', height: '28px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-2 h-2 rounded-full bg-gray-800 ring-1 ring-gray-700"></div>
                <div className="w-12 h-1 rounded-full bg-gray-800"></div>
              </div>
            </div>
            
            {/* Screen */}
            <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: '580px' }}>
              {/* Status Bar */}
              <div className="bg-white px-6 pt-3 pb-1 flex justify-between items-center relative z-10">
                <span className="text-[11px] font-semibold text-gray-900 tracking-tight">9:41</span>
                <div className="flex items-center gap-[3px]">
                  <svg width="16" height="11" viewBox="0 0 16 11" className="text-gray-900">
                    <path d="M1 3.5C3.34 1.17 6.66 1.17 9 3.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    <path d="M3 5.8C4.34 4.5 6.66 4.5 8 5.8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                    <circle cx="5.5" cy="8" r="1" fill="currentColor"/>
                  </svg>
                  <svg width="15" height="11" viewBox="0 0 15 11" className="text-gray-900">
                    <rect x="0.5" y="3" width="2" height="8" rx="0.5" fill="currentColor" opacity="0.3"/>
                    <rect x="4" y="2" width="2" height="9" rx="0.5" fill="currentColor" opacity="0.5"/>
                    <rect x="7.5" y="1" width="2" height="10" rx="0.5" fill="currentColor" opacity="0.7"/>
                    <rect x="11" y="0" width="2" height="11" rx="0.5" fill="currentColor"/>
                  </svg>
                  <div className="relative ml-[2px]">
                    <div className="w-[22px] h-[10px] rounded-[3px] border border-gray-900 flex items-center p-[1.5px]">
                      <div className="w-[60%] h-full bg-gray-900 rounded-[1.5px]"></div>
                    </div>
                    <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] bg-gray-900 rounded-r-full"></div>
                  </div>
                </div>
              </div>

              {/* Scrollable Play Store Content */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 32px)' }}>
                {/* Feature Graphic */}
                {featureGraphic ? (
                  <img src={featureGraphic} alt="Feature" className="w-full h-[130px] object-cover"/>
                ) : (
                  <div className="w-full h-[130px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
                    <div className="text-white/30 text-xs font-medium">Feature Graphic</div>
                  </div>
                )}

                {/* App Info Section */}
                <div className="px-5 pt-4 pb-3">
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    {iconUrl ? (
                      <img src={iconUrl} alt="Icon" className="w-[52px] h-[52px] rounded-[14px] shadow-md flex-shrink-0"/>
                    ) : (
                      <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] text-gray-900 leading-snug truncate">
                        {title || 'Ilova Nomi'}
                      </h3>
                      <p className="text-[11px] text-green-700 font-medium mt-0.5">Developer Name</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-gray-500">Contains ads</span>
                        <span className="text-gray-300 text-[8px]">•</span>
                        <span className="text-[10px] text-gray-500">In-app purchases</span>
                      </div>
                    </div>
                  </div>

                  {/* Install Button */}
                  <button className="w-full mt-3.5 bg-[#01875f] text-white text-[13px] font-semibold py-[9px] rounded-lg shadow-sm">
                    Install
                  </button>

                  {/* Action Row */}
                  <div className="flex items-center justify-around mt-3 py-1">
                    {[
                      { icon: Share2, label: 'Share' },
                      { icon: BookmarkPlus, label: 'Save' },
                    ].map((action) => (
                      <div key={action.label} className="flex flex-col items-center gap-0.5">
                        <action.icon className="w-[16px] h-[16px] text-[#01875f]" />
                        <span className="text-[9px] text-gray-600">{action.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-5"></div>

                {/* Metrics Row */}
                <div className="flex items-center justify-around px-5 py-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[12px] font-bold text-gray-900">4.5</span>
                      <Star className="w-[10px] h-[10px] text-gray-900 fill-gray-900" />
                    </div>
                    <span className="text-[9px] text-gray-500 mt-px">1.2K reviews</span>
                  </div>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-bold text-gray-900">50K+</span>
                    <span className="text-[9px] text-gray-500 mt-px">Downloads</span>
                  </div>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <div className="border border-gray-900 rounded-sm px-1">
                      <span className="text-[9px] font-bold text-gray-900">3+</span>
                    </div>
                    <span className="text-[9px] text-gray-500 mt-px">Rated for 3+</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-5"></div>

                {/* Screenshots */}
                <div className="px-5 pt-3 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {screenshots.length > 0 ? (
                      screenshots.map((screenshot, i) => (
                        <img
                          key={i}
                          src={screenshot}
                          alt={`Screenshot ${i + 1}`}
                          className="flex-shrink-0 w-[82px] h-[148px] object-cover rounded-lg border border-gray-200/60"
                        />
                      ))
                    ) : (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="flex-shrink-0 w-[82px] h-[148px] bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg border border-gray-200/60 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-5 h-5 rounded bg-gray-200 mx-auto mb-1"></div>
                            <span className="text-[7px] text-gray-400">Screen {i}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-5"></div>

                {/* About Section */}
                <div className="px-5 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[13px] font-bold text-gray-900">About this app</h4>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-gray-700 leading-[1.6] line-clamp-4">
                    {shortDesc || fullDesc || 'Ilovangiz haqida qisqa tavsif bu yerda ko\'rinadi. Foydalanuvchilar ilova haqida ma\'lumot o\'qiydi.'}
                  </p>
                </div>

                {/* Tags */}
                <div className="px-5 pt-1 pb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {['Entertainment', 'Free'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 text-[9px] text-gray-600 rounded-full font-medium">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-5"></div>

                {/* Data Safety */}
                <div className="px-5 pt-3 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[13px] font-bold text-gray-900">Data safety</h4>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-[14px] h-[14px] text-gray-500" />
                      <span className="text-[10px] text-gray-700">No data shared with third parties</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Download className="w-[14px] h-[14px] text-gray-500" />
                      <span className="text-[10px] text-gray-700">No data collected</span>
                    </div>
                  </div>
                </div>

                {/* Ratings & Reviews */}
                <div className="px-5 pt-1 pb-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[13px] font-bold text-gray-900">Ratings and reviews</h4>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="text-[40px] font-light text-gray-900 leading-none">4.5</div>
                      <div className="flex mt-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-[10px] h-[10px] ${s <= 4 ? 'text-[#01875f] fill-[#01875f]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-[9px] text-gray-500 mt-0.5">1,234</p>
                    </div>
                    <div className="flex-1 space-y-[3px] pt-1">
                      {[
                        { n: 5, w: '70%' },
                        { n: 4, w: '18%' },
                        { n: 3, w: '6%' },
                        { n: 2, w: '3%' },
                        { n: 1, w: '3%' },
                      ].map((bar) => (
                        <div key={bar.n} className="flex items-center gap-1.5">
                          <span className="text-[9px] text-gray-500 w-2 text-right">{bar.n}</span>
                          <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#01875f] rounded-full" style={{ width: bar.w }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom padding */}
                <div className="h-6"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2">
          <div className="w-[100px] h-[4px] bg-gray-500 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Live Preview Label */}
      <div className="text-center mt-4">
        <span className="inline-flex items-center gap-2 text-[11px] text-gray-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Preview
        </span>
      </div>
    </div>
  );
}
