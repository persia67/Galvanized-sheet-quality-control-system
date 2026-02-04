import React from 'react';
import { Camera, Zap, Eye, Cpu } from 'lucide-react';

const HardwareInfo: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-gradient-to-l from-brand-900 to-brand-700 p-8 rounded-2xl text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-4">راهنمای انتخاب سخت‌افزار بینایی ماشین</h2>
        <p className="text-brand-100 leading-relaxed text-lg">
          برای راه‌اندازی سیستم QC دقیق در خط تولید گالوانیزه، انتخاب دوربین مناسب بسیار حیاتی است. 
          ورق‌های گالوانیزه به دلیل سطح براق و حرکت سریع، چالش‌برانگیز هستند.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            <Camera size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">نوع دوربین: Line Scan</h3>
          <p className="text-slate-600 leading-7 text-justify">
            برای ورق‌های پیوسته (Continuous Web) مثل گالوانیزه، دوربین‌های <strong>Area Scan</strong> (معمولی) مناسب نیستند. 
            شما حتماً نیاز به دوربین‌های <strong>Line Scan</strong> دارید. این دوربین‌ها تصویر را خط به خط می‌سازند و رزولوشن بسیار بالایی در جهت حرکت ورق ارائه می‌دهند.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-4">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">نورپردازی (Lighting)</h3>
          <p className="text-slate-600 leading-7 text-justify">
            سطح گالوانیزه بازتابنده است. برای دیدن عیوب سطحی و فرورفتگی‌ها، نیاز به نورپردازی <strong>Darkfield</strong> یا نورهای خطی با زاویه خاص دارید تا "شوره سفید" و "خش"‌ها مشخص شوند. نورهای Dome یا Coaxial برای سطوح تخت براق پیشنهاد می‌شود.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 border-r-4 border-brand-500 pr-3">برندها و مدل‌های پیشنهادی</h3>
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <ul className="space-y-6">
            <li className="flex gap-4">
              <span className="bg-white font-bold px-3 py-1 rounded border shadow-sm h-fit">Basler</span>
              <div>
                <h4 className="font-bold text-slate-900">سری racer (Basler racer)</h4>
                <p className="text-sm text-slate-600 mt-1">
                  مدل‌های 2k یا 4k line scan. قیمت مناسب نسبت به کارایی. بسیار محبوب در ایران برای خطوط تولید.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="bg-white font-bold px-3 py-1 rounded border shadow-sm h-fit">Teledyne DALSA</span>
              <div>
                <h4 className="font-bold text-slate-900">سری Linea</h4>
                <p className="text-sm text-slate-600 mt-1">
                  استاندارد طلایی صنعت فولاد. سرعت بسیار بالا و نویز کم. مناسب برای سرعت‌های بالای خط تولید.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="bg-white font-bold px-3 py-1 rounded border shadow-sm h-fit">Cognex</span>
              <div>
                <h4 className="font-bold text-slate-900">In-Sight Line Scan</h4>
                <p className="text-sm text-slate-600 mt-1">
                  این دوربین‌ها Smart هستند (پردازنده داخلی دارند) و شاید نیاز شما به سیستم نرم‌افزاری جانبی را کمتر کنند، اما گران‌ترند.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex gap-4">
        <Eye className="text-blue-600 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900">نکته نهایی</h4>
          <p className="text-blue-800 text-sm mt-1">
            برای این نرم‌افزار دمو، هر وب‌کم HD که بتواند فوکوس خوبی روی ورق داشته باشد (ترجیحاً لاجیتک C920 یا بالاتر) برای تست اولیه کافی است. اما برای نصب صنعتی، حتماً از دوربین‌های GigE Vision یا USB3 صنعتی (مثل برندهای بالا) استفاده کنید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HardwareInfo;