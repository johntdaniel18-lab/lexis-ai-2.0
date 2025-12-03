import React from 'react';
import GrammarIcon from '../icons/GrammarIcon';
import BookIcon from '../icons/BookIcon';
import ChainLinkIcon from '../icons/ChainLinkIcon';

const AppPreviewAnimation: React.FC = () => {
    return (
        <div className="relative w-full aspect-[16/10] sm:aspect-video max-w-3xl mx-auto rounded-xl shadow-2xl border-4 border-slate-800 bg-slate-800 overflow-hidden">
            <style>
                {`
                @keyframes slideInUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideInUp1 { animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both; }
                .animate-slideInUp2 { animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s both; }
                .animate-slideInUp3 { animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.1s both; }
                .animate-slideInUp4 { animation: slideInUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.4s both; }
                `}
            </style>
            
            <div className="absolute inset-0 flex">
                {/* Left Side: Fake Essay */}
                <div className="w-3/5 bg-slate-50 p-6 overflow-hidden text-left">
                    <h4 className="font-bold text-sm text-slate-800 mb-3">Your Essay with Highlights</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        The diagram illustrates how orange juice is produced.
                        <br/><br/>
                        Overall, the process involves two main pathways: one for producing fresh juice for immediate sale, and another for creating concentrated juice for later distribution.
                        <br/><br/>
                        Firstly, fresh oranges are picked and transported to a processing facility, where they undergo a thorough washing. Following this, the juice is extracted by a{' '}
                        <span className="bg-rose-100 px-1 rounded-sm">squeezing machine</span>, separating it from solid waste like peels. This waste is collected and repurposed{' '}
                        <span className="bg-emerald-100 px-1 rounded-sm">to feed animals</span>. The fresh juice is then packaged and{' '}
                        <span className="bg-rose-100 px-1 rounded-sm">sent to the supermarket</span> for immediate sale<span className="bg-red-100 px-1 rounded-sm">, this is one route</span>.
                        <br/><br/>
                        Alternatively, the fresh juice is sent to an evaporator where water is removed. The resulting concentrate is canned and stored before being transported to a different factory to be reconstituted with water, packaged, and finally distributed to shops.
                    </p>
                </div>
                
                {/* Right Side: Feedback Cards */}
                <div className="w-2/5 bg-slate-100 border-l border-slate-200 p-2 sm:p-4 overflow-hidden">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-800 mb-3">Improvement Suggestions</h4>
                    <div className="space-y-2 sm:space-y-3">
                        {/* Card 1 */}
                        <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm border border-slate-200 animate-slideInUp1">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-orange-500 text-white shadow-sm">
                                <BookIcon className="h-3 w-3" />
                                Lexical Resource
                            </span>
                             <div className="mt-2 text-[10px] sm:text-xs flex flex-wrap items-center gap-1">
                               <span className="bg-orange-100 text-orange-800 px-1 rounded-sm line-through">squeezing machine</span>
                               <span className="font-bold text-slate-400">&rarr;</span>
                               <span className="bg-emerald-100 text-emerald-800 px-1 rounded-sm">mechanical press</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm border border-slate-200 animate-slideInUp2">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-orange-500 text-white shadow-sm">
                                <ChainLinkIcon className="h-3 w-3" />
                                Coherence & Cohesion
                            </span>
                             <div className="mt-2 text-[10px] sm:text-xs flex flex-wrap items-center gap-1">
                               <span className="bg-orange-100 text-orange-800 px-1 rounded-sm line-through">to feed animals</span>
                               <span className="font-bold text-slate-400">&rarr;</span>
                               <span className="bg-emerald-100 text-emerald-800 px-1 rounded-sm">as animal feed</span>
                            </div>
                        </div>
                         {/* Card 3 */}
                        <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm border border-slate-200 animate-slideInUp3">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-orange-500 text-white shadow-sm">
                                <BookIcon className="h-3 w-3" />
                                Lexical Resource
                            </span>
                             <div className="mt-2 text-[10px] sm:text-xs flex flex-wrap items-center gap-1">
                               <span className="bg-orange-100 text-orange-800 px-1 rounded-sm line-through">sent to the supermarket</span>
                               <span className="font-bold text-slate-400">&rarr;</span>
                               <span className="bg-emerald-100 text-emerald-800 px-1 rounded-sm">dispatched to retailers</span>
                            </div>
                        </div>
                         {/* Card 4 */}
                        <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm border border-slate-200 animate-slideInUp4">
                            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-md bg-orange-500 text-white shadow-sm">
                                <GrammarIcon className="h-3 w-3" />
                                Grammar & Accuracy
                            </span>
                            <div className="mt-2 text-[10px] sm:text-xs flex flex-wrap items-center gap-1">
                               <span className="bg-orange-100 text-orange-800 px-1 rounded-sm line-through">sale, this is one route</span>
                               <span className="font-bold text-slate-400">&rarr;</span>
                               <span className="bg-emerald-100 text-emerald-800 px-1 rounded-sm">sale. This is one route</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppPreviewAnimation;