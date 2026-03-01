import React from 'react';
import { motion } from 'framer-motion';
import { calculateFlowSpeed } from '../utils/utils';
import { ChevronRight } from 'lucide-react'; // ใช้ไอคอนหัวลูกศร [cite: 2025-10-27]

const WindFlowAnimation = ({ airFlowValue, isDarkMode }) => {
    // ⚙️ คำนวณความเร็ว [cite: 2025-10-27]
    const flowDurationStr = calculateFlowSpeed(airFlowValue);
    const durationNum = parseFloat(flowDurationStr);

    // 🛑 ตรวจสอบสถานะการไหล [cite: 2026-02-24]
    const isStopped = !airFlowValue || durationNum <= 0 || isNaN(durationNum);

    // 🎨 กำหนดสีตามสถานะ (ไหล = สีฟ้า/เขียว, หยุด = สีเทา/ฟ้าหม่น) [cite: 2025-10-27]
    const flowColor = isDarkMode ? '#38bdf8' : '#0284c7';
    const stoppedColor = isDarkMode ? '#475569' : '#94a3b8'; // สี Slate (เทาหม่น)
    const currentColor = isStopped ? stoppedColor : flowColor;

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden rounded-full flex items-center transition-colors duration-1000 ${isStopped ? 'bg-black/5' : 'bg-transparent'}`}>

            {/* 💨 คอนเทนเนอร์หัวลูกศร ใช้ Framer Motion ขยับ X [cite: 2025-10-27] */}
            <motion.div
                className="flex gap-8 items-center min-w-full"
                animate={isStopped ? { x: 0 } : { x: ["0%", "-50%"] }} // วิ่งวนลูป [cite: 2025-10-27]
                transition={isStopped ? { duration: 0 } : {
                    duration: durationNum,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                {/* สร้างหัวลูกศรซ้ำๆ เพื่อให้เห็นการไหลต่อเนื่อง */}
                {[...Array(10)].map((_, i) => (
                    <ChevronRight
                        key={i}
                        size={20}
                        color={currentColor}
                        strokeWidth={4}
                        className={`transition-colors duration-1000 ${isStopped ? 'opacity-20' : 'opacity-100'}`}
                    />
                ))}
            </motion.div>

            {/* เอฟเฟกต์สีในท่อ (Tint) เมื่อลมไม่ไหล [cite: 2025-10-27] */}
            {isStopped && (
                <div className="absolute inset-0 bg-slate-500/10 backdrop-grayscale-[0.5]" />
            )}
        </div>
    );
};

export default WindFlowAnimation;