import React from 'react';
import Logo from './icons/Logo';
import Button from './common/Button';
import YoutubeIcon from './icons/YoutubeIcon';
import CheckIcon from './icons/CheckIcon';
import AppPreviewAnimation from './landing/AppPreviewAnimation';
import TestimonialCard from './landing/TestimonialCard';
import XCircleIcon from './icons/XCircleIcon';
import UserAvatarIcon from './icons/UserAvatarIcon';

// New Icons
import FlowChartIcon from './icons/FlowChartIcon';
import DocumentCheckIcon from './icons/DocumentCheckIcon';
import AdjustmentsVerticalIcon from './icons/AdjustmentsVerticalIcon';


interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="group bg-white p-6 rounded-xl shadow-md border border-slate-200/80 transition-all duration-300 hover:shadow-lg hover:border-slate-300/80 hover:-translate-y-1">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-600 mb-4 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{children}</p>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-50 text-slate-800 antialiased">
        {/* Header */}
        <header className="py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
                <Logo className="h-10 w-10" />
                <span className="font-extrabold text-xl">Lexis<span className="text-orange-500 ml-1">AI</span></span>
            </div>
            <Button onClick={onGetStarted} variant="primary" className="px-8 py-4 text-lg font-extrabold">Bắt Đầu Ngay</Button>
        </header>

        <main>
            {/* Hero Section */}
            <section className="text-center py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-normal">
                        Chinh Phục <span className="text-orange-500">IELTS Writing</span> Cùng Gia Sư AI
                    </h1>
                    <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
                        Nhận phản hồi chi tiết, chấm điểm theo tiêu chí & luyện tập chuyên sâu để đạt điểm mục tiêu.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Button onClick={onGetStarted} variant="primary" className="px-8 py-4 text-lg font-extrabold">Bắt Đầu Ngay</Button>
                    </div>
                    <div className="mt-16 max-w-4xl mx-auto">
                      <AppPreviewAnimation />
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                            Công Cụ Luyện Viết Toàn Diện
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Mọi thứ bạn cần để tự tin bước vào phòng thi.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard icon={<FlowChartIcon />} title="Luyện Tập Theo Lộ Trình">
                            Trợ lý AI sẽ hướng dẫn bạn từng bước phân tích đề, lên dàn ý và xây dựng từ vựng trước khi viết.
                        </FeatureCard>
                        <FeatureCard icon={<DocumentCheckIcon />} title="Chấm Điểm & Phản Hồi Tức Thì">
                            Nhận điểm số theo 4 tiêu chí IELTS và các đề xuất cải thiện chi tiết cho từng câu, từng chữ.
                        </FeatureCard>
                        <FeatureCard icon={<AdjustmentsVerticalIcon />} title="Luyện Tập Chuyên Sâu">
                            Xác định điểm yếu và rèn luyện chuyên sâu với thư viện bài tập ngữ pháp, từ vựng được cá nhân hóa.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-12">
                        Luyện Tập Chỉ Với 3 Bước Đơn Giản
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4">
                        <div className="flex-1 text-center group">
                            <div className="text-5xl font-extrabold text-orange-200 mb-2 transition-colors duration-300 group-hover:text-orange-400">1</div>
                            <h3 className="text-xl font-bold mb-2">Chọn Đề Thi</h3>
                            <p className="text-slate-600">Lựa chọn từ thư viện đề thi thật đã được tuyển chọn và tổng hợp.</p>
                        </div>
                         <div className="text-orange-300 text-2xl hidden md:block">&rarr;</div>
                        <div className="flex-1 text-center group">
                            <div className="text-5xl font-extrabold text-orange-300 mb-2 transition-colors duration-300 group-hover:text-orange-500">2</div>
                            <h3 className="text-xl font-bold mb-2">Hoàn Thành Bài Viết</h3>
                            <p className="text-slate-600">Luyện tập trong điều kiện thời gian như thi thật.</p>
                        </div>
                        <div className="text-orange-400 text-2xl hidden md:block">&rarr;</div>
                        <div className="flex-1 text-center group">
                            <div className="text-5xl font-extrabold text-orange-500 mb-2 transition-colors duration-300 group-hover:text-orange-600">3</div>
                            <h3 className="text-xl font-bold mb-2">Nhận Phản Hồi AI</h3>
                            <p className="text-slate-600">Xem điểm số, phân tích lỗi và nhận gợi ý chi tiết.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Guide Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">
                        Hướng Dẫn Trực Quan
                    </h2>
                    <div className="aspect-video bg-slate-200 rounded-xl shadow-lg overflow-hidden border-4 border-slate-200">
                        <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/XHe6s-B4kv8"
                            title="Lexis AI Tutorial"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            </section>
            
            {/* Comparison Section */}
            <section className="py-20 px-6 bg-orange-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Tại Sao Chọn Lexis AI?</h2>
                        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                           So sánh Lexis AI với các phương pháp học khác để thấy sự khác biệt.
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tính Năng</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider">Lexis AI</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Gia Sư</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Tự Học</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {[
                                            { feature: 'Phản Hồi (Feedback)', lexis: <CheckIcon className="h-6 w-6 mx-auto text-orange-600" />, tutor: 'Theo lịch hẹn', self: <XCircleIcon className="h-6 w-6 mx-auto text-red-400" /> },
                                            { feature: 'Chi Phí (Cost)', lexis: <CheckIcon className="h-6 w-6 mx-auto text-orange-600" />, tutor: 'Cao', self: 'Thấp' },
                                            { feature: 'Luyện Tập Cá Nhân Hóa', lexis: <CheckIcon className="h-6 w-6 mx-auto text-orange-600" />, tutor: 'Hạn chế', self: <XCircleIcon className="h-6 w-6 mx-auto text-red-400" /> },
                                            { feature: 'Số Lượng Đề Thi', lexis: <CheckIcon className="h-6 w-6 mx-auto text-orange-600" />, tutor: 'Giới hạn', self: 'Phụ thuộc' },
                                        ].map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 align-middle">{item.feature}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-orange-700 bg-orange-50/50 align-middle">{item.lexis}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600 align-middle">{item.tutor}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-600 align-middle">{item.self}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Testimonials Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                           Học Viên Nói Gì Về Lexis AI?
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <TestimonialCard
                            name="Lan Anh"
                            goal="Mục tiêu: Band 7.0"
                            quote="Lexis AI chỉ ra những lỗi ngữ pháp nhỏ nhất mà tôi không bao giờ nhận thấy. Điểm số của tôi đã tăng từ 6.5 lên 7.5 chỉ sau một tháng!"
                        />
                        <TestimonialCard
                            name="Minh Quân"
                            goal="Cần Band 6.5 gấp"
                            quote="Tính năng luyện tập theo lộ trình thực sự thay đổi cuộc chơi. Tôi không còn cảm thấy mông lung khi bắt đầu viết nữa, mọi thứ đều rất có cấu trúc."
                        />
                        <TestimonialCard
                            name="Thu Hà"
                            goal="Thi lại lần 2"
                            quote="Phản hồi tức thì là điều tuyệt vời nhất. Tôi có thể sửa lỗi và viết lại ngay lập tức, tiến bộ nhanh hơn rất nhiều so với việc chờ gia sư chấm bài."
                        />
                        <TestimonialCard
                            name="Hoàng Nam"
                            goal="Từ 6.0 lên 7.0"
                            quote="Tính năng gợi ý từ vựng và brainstorm ý tưởng của Lexis AI thật tuyệt vời. Tôi không còn bị bí ý hay lặp từ nữa, bài viết của tôi giờ đây học thuật hơn hẳn."
                        />
                    </div>
                </div>
            </section>

             {/* FAQ Section */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-10">
                        Câu Hỏi Thường Gặp
                    </h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h4 className="font-bold text-slate-900">Tôi có cần Gemini API Key của riêng mình không?</h4>
                        <p className="mt-2 text-slate-600 text-sm">
                            Có. Lexis AI được xây dựng trên nền tảng công nghệ của Google Gemini. Để sử dụng ứng dụng, bạn cần cung cấp API key của riêng mình. Việc này đảm bảo bạn có trải nghiệm tốt nhất và không bị giới hạn bởi lượt sử dụng chung.
                        </p>
                        <a
                            href="https://www.youtube.com/watch?v=dEdQOGcpSRg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-bold mt-4 transition-colors"
                        >
                            <YoutubeIcon className="h-5 w-5" />
                            Xem hướng dẫn lấy API Key
                        </a>
                    </div>
                </div>
            </section>

             {/* Final CTA */}
            <section className="py-16 px-6 bg-orange-500 relative overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md">
                        Sẵn sàng nâng band điểm IELTS Writing của bạn?
                    </h2>
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={onGetStarted} 
                            className="px-8 py-4 text-lg bg-white text-orange-600 font-extrabold rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-white/50"
                        >
                            Bắt Đầu Ngay
                        </button>
                    </div>
                </div>
            </section>
        </main>
        
        {/* Footer */}
        <footer className="text-center py-6 bg-slate-100 border-t border-slate-200">
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Lexis AI. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default LandingPage;