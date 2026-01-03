(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/RadarTimeline.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const RadarTimeline = ({ frames, currentFrameIndex, isPlaying, onFrameSelect, onPlayPause })=>{
    // Filter out frames without time
    const validFrames = frames.filter((frame)=>frame.time != null);
    if (validFrames.length === 0) return null;
    const currentFrame = validFrames[currentFrameIndex] || validFrames[0];
    const startTime = validFrames[0]?.time || 0;
    const endTime = validFrames[validFrames.length - 1]?.time || 0;
    const totalDuration = endTime - startTime;
    const formatTime = (timestamp)=>{
        const date = new Date(timestamp);
        const now = Date.now();
        const diffHours = Math.floor((now - timestamp) / (1000 * 60 * 60));
        if (diffHours === 0) return 'Now';
        if (diffHours === 1) return '1h ago';
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return '1d ago';
        return `${diffDays}d ago`;
    };
    const getProgress = ()=>{
        if (totalDuration === 0 || !currentFrame.time) return 0;
        return (currentFrame.time - startTime) / totalDuration * 100;
    };
    const handleTimelineClick = (event)=>{
        const rect = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const progress = clickX / rect.width;
        const targetTime = startTime + progress * totalDuration;
        // Find the closest frame
        let closestIndex = 0;
        let minDiff = Math.abs((validFrames[0]?.time || 0) - targetTime);
        validFrames.forEach((frame, index)=>{
            if (!frame.time) return;
            const diff = Math.abs(frame.time - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });
        onFrameSelect(closestIndex);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-xl p-4 max-w-md border border-gray-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onPlayPause,
                                className: `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 font-bold text-lg shadow-md ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`,
                                title: isPlaying ? 'Pause radar animation' : 'Play radar animation',
                                children: isPlaying ? '⏸' : '▶'
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarTimeline.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm font-semibold text-gray-800",
                                children: [
                                    "Radar: ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-600 font-bold",
                                        children: currentFrame.time ? formatTime(currentFrame.time) : 'Unknown'
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/RadarTimeline.tsx",
                                        lineNumber: 86,
                                        columnNumber: 20
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/RadarTimeline.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md",
                        children: [
                            frames.length,
                            " frames • ",
                            Math.round(totalDuration / (1000 * 60 * 60)),
                            "h range"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarTimeline.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-3 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors shadow-inner",
                onClick: handleTimelineClick,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 shadow-md",
                        style: {
                            width: `${getProgress()}%`
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg hover:scale-110 transition-transform",
                        style: {
                            left: `${getProgress()}%`,
                            transform: 'translate(-50%, -50%)'
                        }
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 flex items-center",
                        children: validFrames.map((frame, index)=>{
                            if (!frame.time) return null;
                            const position = totalDuration > 0 ? (frame.time - startTime) / totalDuration * 100 : 0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute w-1 h-2 bg-blue-400 rounded-full opacity-60 hover:opacity-100 hover:h-3 transition-all",
                                style: {
                                    left: `${position}%`
                                },
                                title: formatTime(frame.time)
                            }, index, false, {
                                fileName: "[project]/app/components/RadarTimeline.tsx",
                                lineNumber: 119,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0));
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarTimeline.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between mt-1 text-xs text-gray-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: formatTime(startTime)
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: formatTime(endTime)
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarTimeline.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarTimeline.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/RadarTimeline.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_c = RadarTimeline;
const __TURBOPACK__default__export__ = RadarTimeline;
var _c;
__turbopack_context__.k.register(_c, "RadarTimeline");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/RadarControls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RadarControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-client] (ecmascript) <export default as Pause>");
'use client';
;
;
function RadarControls({ isPlaying, onPlayPause, opacity, onOpacityChange, speed, onSpeedChange, frameCount, currentFrame, radarSource }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 min-w-[400px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-green-400 animate-pulse"
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 36,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white font-semibold text-sm",
                                children: radarSource === 'synthetic' ? '🧪 Synthetic Radar' : '🛰️ Live Radar'
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white/60 text-xs font-mono",
                        children: [
                            currentFrame,
                            "/",
                            frameCount
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarControls.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onPlayPause,
                className: "w-full mb-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95",
                children: [
                    isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 56,
                        columnNumber: 22
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                        size: 20
                    }, void 0, false, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 56,
                        columnNumber: 44
                    }, this),
                    isPlaying ? 'Pause' : 'Play',
                    " Animation"
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarControls.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-white/80 text-xs font-semibold mb-2 block",
                                children: "Opacity"
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "0",
                                max: "1",
                                step: "0.05",
                                value: opacity,
                                onChange: (e)=>onOpacityChange(Number(e.target.value)),
                                className: "w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 68,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-white/60 text-xs mt-1 text-center",
                                children: [
                                    Math.round(opacity * 100),
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 64,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-white/80 text-xs font-semibold mb-2 block",
                                children: "Speed"
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "100",
                                max: "2000",
                                step: "50",
                                value: speed,
                                onChange: (e)=>onSpeedChange(Number(e.target.value)),
                                className: "w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-400 [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                            }, void 0, false, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-white/60 text-xs mt-1 text-center",
                                children: [
                                    2000 - speed,
                                    "ms"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/RadarControls.tsx",
                                lineNumber: 112,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/RadarControls.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/RadarControls.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/RadarControls.tsx",
        lineNumber: 29,
        columnNumber: 5
    }, this);
}
_c = RadarControls;
var _c;
__turbopack_context__.k.register(_c, "RadarControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ResortSidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResortSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/funnel.js [app-client] (ecmascript) <export default as Filter>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function ResortSidebar({ resorts }) {
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('snowfall');
    const filtered = resorts.filter((r)=>r.name.toLowerCase().includes(search.toLowerCase())).sort((a, b)=>{
        if (sortBy === 'snowfall') return b.recentSnowfall - a.recentSnowfall;
        return a.name.localeCompare(b.name);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed right-4 top-4 bottom-4 w-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-white/10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-white font-bold text-lg mb-3",
                        children: "Resort Conditions"
                    }, void 0, false, {
                        fileName: "[project]/app/components/ResortSidebar.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 text-white/40",
                                size: 18
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                lineNumber: 39,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search resorts...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: "w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortSidebar.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setSortBy((s)=>s === 'snowfall' ? 'name' : 'snowfall'),
                        className: "text-xs text-white/60 hover:text-white flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$funnel$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Filter$3e$__["Filter"], {
                                size: 14
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            "Sort by: ",
                            sortBy === 'snowfall' ? 'Snowfall' : 'Name'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortSidebar.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ResortSidebar.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-2",
                children: filtered.map((resort)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-all duration-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start mb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-white font-semibold text-sm",
                                                children: resort.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                                lineNumber: 72,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-white/60 text-xs",
                                                children: resort.state
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                                lineNumber: 75,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortSidebar.tsx",
                                        lineNumber: 71,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-blue-400 font-bold text-lg",
                                        children: [
                                            resort.recentSnowfall,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortSidebar.tsx",
                                        lineNumber: 77,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3 text-xs text-white/60",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Base: ",
                                            resort.snowDepth,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortSidebar.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Temp: ",
                                            resort.baseTemp,
                                            "°F"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortSidebar.tsx",
                                        lineNumber: 83,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortSidebar.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this)
                        ]
                    }, resort.id, true, {
                        fileName: "[project]/app/components/ResortSidebar.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/components/ResortSidebar.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ResortSidebar.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(ResortSidebar, "EAi0WMerKUjIQot6b88h8fayh+o=");
_c = ResortSidebar;
var _c;
__turbopack_context__.k.register(_c, "ResortSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ResortMap.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$RadarTimeline$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/RadarTimeline.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$RadarControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/RadarControls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ResortSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ResortSidebar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const ResortMap = ({ resorts = [], conditions = {}, loading = {}, errors = {} })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const markersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvas2Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const popupsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const [radarPlaying, setRadarPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [radarSpeedMs, setRadarSpeedMs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(800);
    const [radarOpacity, setRadarOpacity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.6);
    const [radarFramesAvailable, setRadarFramesAvailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [frameCount, setFrameCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loadingStatus, setLoadingStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Initializing map...');
    const [mapReady, setMapReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedResort, setSelectedResort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [radarSource, setRadarSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('synthetic');
    const [currentFrameTime, setCurrentFrameTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const radarFramesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const radarIndexRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const radarPlayingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const tileBitmapCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const frameCanvasCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Map());
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastRenderTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const mapPanZoomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        panning: false,
        zooming: false
    });
    // Timeline handlers
    const handleFrameSelect = (index)=>{
        radarIndexRef.current = index;
        setRadarPlaying(false);
        radarPlayingRef.current = false;
    };
    const handlePlayPause = ()=>{
        const newPlaying = !radarPlaying;
        setRadarPlaying(newPlaying);
        radarPlayingRef.current = newPlaying;
    };
    // Initialize map
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (mapRef.current) return;
            if (!containerRef.current) return;
            if (containerRef.current.innerHTML !== '') containerRef.current.innerHTML = '';
            console.log('[Map] Starting initialization...');
            try {
                const map = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["map"](containerRef.current, {
                    center: [
                        43.5,
                        -71.5
                    ],
                    zoom: 7,
                    scrollWheelZoom: true
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tileLayer"]('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
                mapRef.current = map;
                if (!map.getPane('radarPane')) map.createPane('radarPane');
                const radarPane = map.getPane('radarPane');
                radarPane.style.zIndex = '400';
                radarPane.style.pointerEvents = 'none';
                const markerPane = map.getPane('markerPane');
                markerPane.style.zIndex = '700';
                const container2 = document.createElement('div');
                container2.style.position = 'absolute';
                container2.style.left = '0';
                container2.style.top = '0';
                container2.style.width = '100%';
                container2.style.height = '100%';
                container2.style.pointerEvents = 'none';
                // Create two canvases for smooth cross-fading
                const canvas1 = document.createElement('canvas');
                canvas1.style.position = 'absolute';
                canvas1.style.left = '0';
                canvas1.style.top = '0';
                canvas1.style.pointerEvents = 'none';
                canvas1.style.opacity = '1';
                canvas1.style.willChange = 'opacity';
                const canvas2 = document.createElement('canvas');
                canvas2.style.position = 'absolute';
                canvas2.style.left = '0';
                canvas2.style.top = '0';
                canvas2.style.pointerEvents = 'none';
                canvas2.style.opacity = '0';
                canvas2.style.willChange = 'opacity';
                container2.appendChild(canvas1);
                container2.appendChild(canvas2);
                radarPane.appendChild(container2);
                canvasRef.current = canvas1;
                canvas2Ref.current = canvas2;
                const resizeCanvas = {
                    "ResortMap.useEffect.resizeCanvas": ()=>{
                        if (!canvas1 || !canvas2 || !map) return;
                        const size = map.getSize();
                        const dpr = window.devicePixelRatio || 1;
                        canvas1.width = size.x * dpr;
                        canvas1.height = size.y * dpr;
                        canvas1.style.width = `${size.x}px`;
                        canvas1.style.height = `${size.y}px`;
                        const ctx1 = canvas1.getContext('2d');
                        if (ctx1) ctx1.setTransform(dpr, 0, 0, dpr, 0, 0);
                        canvas2.width = size.x * dpr;
                        canvas2.height = size.y * dpr;
                        canvas2.style.width = `${size.x}px`;
                        canvas2.style.height = `${size.y}px`;
                        const ctx2 = canvas2.getContext('2d');
                        if (ctx2) ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
                    // Don't clear cache on resize - let it rebuild naturally to prevent flashing
                    }
                }["ResortMap.useEffect.resizeCanvas"];
                resizeCanvas();
                map.on('resize', resizeCanvas);
                map.on('movestart', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.panning = true;
                    }
                }["ResortMap.useEffect"]);
                map.on('moveend', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.panning = false;
                        // Don't clear cache immediately, let it rebuild naturally
                        setTimeout({
                            "ResortMap.useEffect": ()=>frameCanvasCache.current.clear()
                        }["ResortMap.useEffect"], 1000);
                    }
                }["ResortMap.useEffect"]);
                map.on('zoomstart', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.zooming = true;
                    }
                }["ResortMap.useEffect"]);
                map.on('zoomend', {
                    "ResortMap.useEffect": ()=>{
                        mapPanZoomRef.current.zooming = false;
                        // Don't clear cache immediately, let it rebuild naturally
                        setTimeout({
                            "ResortMap.useEffect": ()=>frameCanvasCache.current.clear()
                        }["ResortMap.useEffect"], 1000);
                    }
                }["ResortMap.useEffect"]);
                setTimeout({
                    "ResortMap.useEffect": ()=>map.invalidateSize()
                }["ResortMap.useEffect"], 200);
                console.log('[Map] Initialization complete');
                setMapReady(true);
                setLoadingStatus('Map ready. Loading frames...');
            } catch (error) {
                console.error('[Map] Initialization failed:', error);
                setLoadingStatus('Map initialization failed');
            }
        }
    }["ResortMap.useEffect"], []);
    // Load radar frames - try REAL radar first, synthetic as fallback
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (!mapReady) return;
            const loadFrames = {
                "ResortMap.useEffect.loadFrames": async ()=>{
                    try {
                        // Clear any existing cache and force fresh data
                        console.log('[Frames] Loading radar frames with cache busting...');
                        // Try multi-source radar system (NOAA, RainViewer, OpenWeatherMap)
                        const radarRes = await fetch(`/api/radar/frames?t=${Date.now()}`, {
                            signal: AbortSignal.timeout(8000),
                            headers: {
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            }
                        });
                        if (radarRes.ok) {
                            const data = await radarRes.json();
                            const frames = data?.radar?.past || [];
                            if (frames.length > 0) {
                                console.log('[Frames] Using multi-source radar:', frames.length, 'frames from', data?.metadata?.sources?.length || 0, 'sources');
                                const frameObjects = frames.map({
                                    "ResortMap.useEffect.loadFrames.frameObjects": (frame)=>({
                                            url: frame.url,
                                            time: frame.time
                                        })
                                }["ResortMap.useEffect.loadFrames.frameObjects"]);
                                // Clear existing caches to ensure fresh animation
                                tileBitmapCache.current.clear();
                                frameCanvasCache.current.clear();
                                radarFramesRef.current = frameObjects;
                                setFrameCount(frameObjects.length);
                                setRadarFramesAvailable(frameObjects.length > 0);
                                setRadarSource(data?.metadata?.source || 'multi-source');
                                setLoadingStatus(`Ready: ${frameObjects.length} frames (${data?.metadata?.source || 'Multi-source radar'})`);
                                return;
                            } else {
                                console.warn('[Frames] Multi-source radar returned empty frames array');
                            }
                        } else {
                            console.error('[Frames] Multi-source radar failed:', radarRes.status, radarRes.statusText);
                            const errorText = await radarRes.text().catch({
                                "ResortMap.useEffect.loadFrames": ()=>'Unknown error'
                            }["ResortMap.useEffect.loadFrames"]);
                            console.error('[Frames] Error details:', errorText);
                        }
                        // Fallback to synthetic (resort snowfall heatmap)
                        console.log('[Frames] Real radar failed, trying synthetic frames...');
                        const synthRes = await fetch('/api/radar/synthetic-frames', {
                            signal: AbortSignal.timeout(3000),
                            headers: {
                                'Cache-Control': 'no-cache'
                            }
                        });
                        if (synthRes.ok) {
                            const data = await synthRes.json();
                            const layers = data?.radar?.layers || [];
                            if (layers.length > 0) {
                                console.log('[Frames] Using synthetic:', layers.length, 'frames');
                                const frameObjects = layers.map({
                                    "ResortMap.useEffect.loadFrames.frameObjects": (layer)=>({
                                            url: layer.url,
                                            time: layer.timestamp
                                        })
                                }["ResortMap.useEffect.loadFrames.frameObjects"]);
                                radarFramesRef.current = frameObjects;
                                setFrameCount(frameObjects.length);
                                setRadarFramesAvailable(frameObjects.length > 0);
                                setRadarSource('synthetic');
                                setLoadingStatus(`Ready: ${frameObjects.length} synthetic frames (IDW from resorts)`);
                                return;
                            }
                        }
                        throw new Error('All radar sources failed');
                    } catch (e) {
                        console.error('[Frames] Load failed:', e);
                        setLoadingStatus(`Failed to load frames: ${e}`);
                    }
                }
            }["ResortMap.useEffect.loadFrames"];
            loadFrames();
        }
    }["ResortMap.useEffect"], [
        mapReady
    ]);
    // Add resort markers with proper popup binding
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (!mapRef.current || resorts.length === 0) return;
            const map = mapRef.current;
            const activeIds = new Set(resorts.map({
                "ResortMap.useEffect": (r)=>r.id
            }["ResortMap.useEffect"]));
            markersRef.current.forEach({
                "ResortMap.useEffect": (marker, id)=>{
                    if (!activeIds.has(id)) {
                        marker.remove();
                        markersRef.current.delete(id);
                        popupsRef.current.delete(id);
                    }
                }
            }["ResortMap.useEffect"]);
            resorts.forEach({
                "ResortMap.useEffect": (resort)=>{
                    const cond = conditions[resort.id];
                    const err = errors[resort.id];
                    const isLoading = loading[resort.id];
                    let markerColor = '#9CA3AF';
                    let markerRadius = 8;
                    let markerWeight = 2;
                    if (err) {
                        markerColor = '#EF4444';
                        markerRadius = 7;
                    } else if (cond) {
                        if (cond.recentSnowfall >= 12) {
                            markerColor = '#0EA5E9';
                            markerRadius = 12;
                            markerWeight = 3;
                        } else if (cond.recentSnowfall >= 6) {
                            markerColor = '#06B6D4';
                            markerRadius = 10;
                            markerWeight = 3;
                        } else if (cond.recentSnowfall >= 1) {
                            markerColor = '#3B82F6';
                            markerRadius = 9;
                        } else {
                            markerColor = '#F59E0B';
                            markerRadius = 8;
                        }
                    }
                    if (markersRef.current.has(resort.id)) {
                        const existing = markersRef.current.get(resort.id);
                        existing.setStyle({
                            fillColor: markerColor,
                            radius: markerRadius,
                            weight: markerWeight
                        });
                        if (popupsRef.current.has(resort.id)) {
                            const popup = popupsRef.current.get(resort.id);
                            popup.setContent(buildPopupContent(resort, cond, err, isLoading));
                        }
                        return;
                    }
                    const marker = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["circleMarker"]([
                        resort.lat,
                        resort.lon
                    ], {
                        radius: markerRadius,
                        fillColor: markerColor,
                        color: '#FFFFFF',
                        weight: markerWeight,
                        opacity: 1,
                        fillOpacity: 0.9,
                        pane: 'markerPane'
                    }).addTo(map);
                    const popupContent = buildPopupContent(resort, cond, err, isLoading);
                    const popup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["popup"]({
                        maxWidth: 320,
                        closeButton: true
                    }).setContent(popupContent);
                    marker.bindPopup(popup);
                    popupsRef.current.set(resort.id, popup);
                    marker.on('click', {
                        "ResortMap.useEffect": (e)=>{
                            if (cond) {
                                setSelectedResort({
                                    resort,
                                    conditions: cond
                                });
                            }
                            setTimeout({
                                "ResortMap.useEffect": ()=>{
                                    marker.openPopup();
                                }
                            }["ResortMap.useEffect"], 0);
                        }
                    }["ResortMap.useEffect"]);
                    marker.on('mouseover', {
                        "ResortMap.useEffect": function() {
                            this.setRadius(markerRadius * 1.3);
                        }
                    }["ResortMap.useEffect"]);
                    marker.on('mouseout', {
                        "ResortMap.useEffect": function() {
                            this.setRadius(markerRadius);
                        }
                    }["ResortMap.useEffect"]);
                    markersRef.current.set(resort.id, marker);
                }
            }["ResortMap.useEffect"]);
        }
    }["ResortMap.useEffect"], [
        resorts,
        conditions,
        loading,
        errors
    ]);
    const buildPopupContent = (resort, cond, err, isLoading)=>{
        const div = document.createElement('div');
        div.style.cssText = 'font-size: 13px; font-family: system-ui; padding: 8px; min-width: 240px;';
        let html = `<div style="font-weight: bold; font-size: 15px; margin-bottom: 12px; color: #1f2937;">${resort.name}, ${resort.state}</div>`;
        if (isLoading) {
            html += `<div style="color: #666; padding: 8px; background: #f3f4f6; border-radius: 4px;">⏳ Loading conditions...</div>`;
        } else if (err) {
            html += `<div style="color: #DC2626; padding: 8px; background: #fee2e2; border-radius: 4px;">❌ Error: ${err}</div>`;
        } else if (cond) {
            // Snowfall section
            html += `<div style="margin-bottom: 12px;">`;
            html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">❄️ Snowfall</div>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
            html += `<div style="background: #dbeafe; padding: 6px; border-radius: 4px; border-left: 3px solid #0EA5E9;"><div style="font-size: 10px; color: #0c4a6e; font-weight: 600;">24h Total</div><div style="color: #0EA5E9; font-weight: bold; font-size: 14px;">${cond.recentSnowfall}"</div></div>`;
            html += `<div style="background: #eff6ff; padding: 6px; border-radius: 4px; border-left: 3px solid #3B82F6;"><div style="font-size: 10px; color: #1e40af; font-weight: 600;">7d Total</div><div style="color: #3B82F6; font-weight: bold; font-size: 14px;">${cond.weeklySnowfall || 0}"</div></div>`;
            html += `</div></div>`;
            // Rainfall section
            html += `<div style="margin-bottom: 12px;">`;
            html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">🌧️ Rainfall</div>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
            html += `<div style="background: #f0f9ff; padding: 6px; border-radius: 4px; border-left: 3px solid #06b6d4;"><div style="font-size: 10px; color: #0c4a6e; font-weight: 600;">24h Total</div><div style="color: #06b6d4; font-weight: bold; font-size: 14px;">${(cond.recentRainfall || 0).toFixed(1)}"</div></div>`;
            html += `<div style="background: #f0fdf4; padding: 6px; border-radius: 4px; border-left: 3px solid #10b981;"><div style="font-size: 10px; color: #166534; font-weight: 600;">7d Total</div><div style="color: #10b981; font-weight: bold; font-size: 14px;">${(cond.weeklyRainfall || 0).toFixed(1)}"</div></div>`;
            html += `</div></div>`;
            // Current conditions section
            html += `<div style="margin-bottom: 12px;">`;
            html += `<div style="font-weight: 600; font-size: 12px; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">🌡️ Current Conditions</div>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">`;
            html += `<div style="background: #fef2f2; padding: 6px; border-radius: 4px; border-left: 3px solid #EF4444;"><div style="font-size: 10px; color: #7f1d1d; font-weight: 600;">Temperature</div><div style="color: #EF4444; font-weight: bold; font-size: 14px;">${cond.baseTemp}°F</div></div>`;
            html += `<div style="background: #f3f4f6; padding: 6px; border-radius: 4px; border-left: 3px solid #6b7280;"><div style="font-size: 10px; color: #374151; font-weight: 600;">Wind Speed</div><div style="color: #374151; font-weight: bold; font-size: 14px;">${cond.windSpeed} mph</div></div>`;
            html += `</div></div>`;
            if (resort.conditionsUrl || resort.scrapeUrl) {
                const url = resort.conditionsUrl || resort.scrapeUrl;
                html += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; background: #0EA5E9; color: white; padding: 10px 12px; border-radius: 4px; font-weight: 600; font-size: 12px; text-decoration: none; text-align: center; cursor: pointer; margin-top: 8px; transition: background 0.2s;">� View Live Conditions →</a>`;
            }
        }
        div.innerHTML = html;
        return div;
    };
    const getTileBitmap = async (layer, z, x, y)=>{
        const layerStr = typeof layer === 'string' ? layer : layer.url;
        const key = `${layerStr}_${z}_${x}_${y}`;
        if (tileBitmapCache.current.has(key)) return tileBitmapCache.current.get(key) || null;
        try {
            let url;
            // Handle synthetic radar URLs directly
            if (layerStr.includes('/api/radar/synthetic?hour=')) {
                // Extract hour parameter and build tile URL
                const hourMatch = layerStr.match(/hour=(\d+)/);
                if (hourMatch) {
                    const hour = hourMatch[1];
                    url = `/api/radar/synthetic?hour=${hour}&z=${z}&x=${x}&y=${y}`;
                } else {
                    return null;
                }
            } else {
                // Extract timestamp from layer string (format: "source-timestamp")
                const timestamp = layerStr.split('-').pop();
                const timeParam = timestamp && !isNaN(parseInt(timestamp)) ? parseInt(timestamp) : Date.now();
                url = `/api/radar/tile?time=${timeParam}&z=${z}&x=${x}&y=${y}`;
            }
            const resp = await fetch(url, {
                signal: AbortSignal.timeout(5000)
            });
            if (!resp.ok) return null;
            const blob = await resp.blob();
            if (blob.size === 0) return null;
            const bitmap = await createImageBitmap(blob);
            tileBitmapCache.current.set(key, bitmap);
            if (tileBitmapCache.current.size > 256) {
                const firstKey = tileBitmapCache.current.keys().next().value;
                if (firstKey) tileBitmapCache.current.delete(firstKey);
            }
            return bitmap;
        } catch (e) {
            return null;
        }
    };
    const renderFrameToCanvas = async (layer, z, widthPx, heightPx, key)=>{
        if (frameCanvasCache.current.has(key)) return frameCanvasCache.current.get(key) || null;
        try {
            const dpr = window.devicePixelRatio || 1;
            const c = document.createElement('canvas');
            c.width = widthPx * dpr;
            c.height = heightPx * dpr;
            const ctx = c.getContext('2d');
            if (!ctx) return null;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const map = mapRef.current;
            if (!map) return null;
            const size = map.getSize();
            const center = map.getCenter();
            const centerWorld = map.project(center, z);
            const leftWorldX = centerWorld.x - size.x / 2;
            const topWorldY = centerWorld.y - size.y / 2;
            const xMin = Math.floor(leftWorldX / 256);
            const xMax = Math.floor((leftWorldX + size.x) / 256);
            const yMin = Math.floor(topWorldY / 256);
            const yMax = Math.floor((topWorldY + size.y) / 256);
            const tilesAcross = Math.pow(2, z);
            const tilePromises = [];
            for(let tx = xMin; tx <= xMax; tx++){
                for(let ty = yMin; ty <= yMax; ty++){
                    const wrapX = (tx % tilesAcross + tilesAcross) % tilesAcross;
                    const wrapY = ty;
                    if (wrapY < 0 || wrapY >= tilesAcross) continue;
                    tilePromises.push((async ()=>{
                        const bitmap = await getTileBitmap(layer, z, wrapX, wrapY);
                        if (!bitmap) return;
                        const tileWorldX = tx * 256;
                        const tileWorldY = ty * 256;
                        const canvasX = (tileWorldX - leftWorldX) * dpr;
                        const canvasY = (tileWorldY - topWorldY) * dpr;
                        ctx.drawImage(bitmap, canvasX, canvasY, 256 * dpr, 256 * dpr);
                    })());
                }
            }
            const limit = 6;
            for(let i = 0; i < tilePromises.length; i += limit){
                await Promise.all(tilePromises.slice(i, i + limit));
            }
            frameCanvasCache.current.set(key, c);
            if (frameCanvasCache.current.size > 32) {
                const firstKey = frameCanvasCache.current.keys().next().value;
                if (firstKey) frameCanvasCache.current.delete(firstKey);
            }
            return c;
        } catch (e) {
            return null;
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            let lastTime = performance.now();
            let progress = 0;
            let currentFrameIndex = 0;
            let nextFrameIndex = 1;
            // Calculate proper frame timing based on timestamps
            const calculateFrameDuration = {
                "ResortMap.useEffect.calculateFrameDuration": ()=>{
                    const frames = radarFramesRef.current;
                    if (frames.length < 2) return 800; // fallback
                    // Get timestamps from frames
                    const timestamps = frames.map({
                        "ResortMap.useEffect.calculateFrameDuration.timestamps": (f)=>f.time
                    }["ResortMap.useEffect.calculateFrameDuration.timestamps"]).filter({
                        "ResortMap.useEffect.calculateFrameDuration.timestamps": (t)=>t !== undefined && !isNaN(t)
                    }["ResortMap.useEffect.calculateFrameDuration.timestamps"]).sort({
                        "ResortMap.useEffect.calculateFrameDuration.timestamps": (a, b)=>a - b
                    }["ResortMap.useEffect.calculateFrameDuration.timestamps"]);
                    if (timestamps.length < 2) return 800;
                    const timeSpanMs = timestamps[timestamps.length - 1] - timestamps[0]; // Total time span in ms
                    const desiredAnimationDurationMs = 60000; // 60 seconds for full animation
                    const frameDuration = desiredAnimationDurationMs / frames.length;
                    console.log(`[Animation] Time span: ${timeSpanMs}ms (${timeSpanMs / 3600000}h), Frame duration: ${frameDuration}ms`);
                    return Math.max(100, Math.min(frameDuration, 2000)); // Clamp between 100ms and 2000ms
                }
            }["ResortMap.useEffect.calculateFrameDuration"];
            const frameDuration = calculateFrameDuration();
            const step = {
                "ResortMap.useEffect.step": async (now)=>{
                    const c1 = canvasRef.current;
                    const c2 = canvas2Ref.current;
                    if (!c1 || !c2) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    if (!radarPlayingRef.current || !radarFramesAvailable) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    const frames = radarFramesRef.current;
                    if (!frames || frames.length === 0) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    if (mapPanZoomRef.current.panning || mapPanZoomRef.current.zooming) {
                        // During pan/zoom, continue rendering with cached frames but skip expensive operations
                        const timeSinceLastRender = now - lastRenderTimeRef.current;
                        if (timeSinceLastRender < 200) {
                            rafRef.current = requestAnimationFrame(step);
                            return;
                        }
                        const map = mapRef.current;
                        if (!map) {
                            rafRef.current = requestAnimationFrame(step);
                            return;
                        }
                        const z = Math.max(0, Math.round(map.getZoom() || 5));
                        const size = map.getSize();
                        const idx = Math.floor(radarIndexRef.current) % frames.length;
                        if (idx < 0 || idx >= frames.length || !frames[idx]) {
                            rafRef.current = requestAnimationFrame(step);
                            return;
                        }
                        const key = `${frames[idx].url}_${z}_${size.x}_${size.y}`;
                        if (frameCanvasCache.current.has(key)) {
                            const cachedC = frameCanvasCache.current.get(key);
                            if (cachedC) {
                                const ctx1 = c1.getContext('2d');
                                const ctx2 = c2.getContext('2d');
                                if (ctx1 && ctx2) {
                                    ctx1.clearRect(0, 0, c1.width, c1.height);
                                    ctx2.clearRect(0, 0, c2.width, c2.height);
                                    ctx1.drawImage(cachedC, 0, 0);
                                    ctx2.drawImage(cachedC, 0, 0);
                                    c1.style.opacity = '1';
                                    c2.style.opacity = '0';
                                    lastRenderTimeRef.current = now;
                                }
                            }
                        }
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    const elapsed = now - lastTime;
                    lastTime = now;
                    progress += elapsed;
                    const dur = frameDuration; // Use calculated frame duration instead of radarSpeedMs
                    const t = Math.min(1, progress / dur);
                    const timeSinceLastRender = now - lastRenderTimeRef.current;
                    if (timeSinceLastRender < 50) {
                        rafRef.current = requestAnimationFrame(step);
                        return;
                    }
                    try {
                        const map = mapRef.current;
                        if (!map) {
                            rafRef.current = requestAnimationFrame(step);
                            return;
                        }
                        const z = Math.max(0, Math.round(map.getZoom() || 5));
                        const size = map.getSize();
                        // Update frame indices based on progress
                        const totalFrames = frames.length;
                        const frameProgress = (radarIndexRef.current + t) % totalFrames;
                        currentFrameIndex = Math.floor(frameProgress) % totalFrames;
                        nextFrameIndex = (currentFrameIndex + 1) % totalFrames;
                        const frameBlend = frameProgress - Math.floor(frameProgress);
                        // Update radarIndexRef.current continuously for smooth progression
                        radarIndexRef.current = Math.floor(frameProgress) % totalFrames;
                        // Update current frame timestamp for overlay
                        const currentFrame = frames[Math.floor(radarIndexRef.current)];
                        if (currentFrame?.time) {
                            setCurrentFrameTime(currentFrame.time);
                        }
                        // Safety check for frame indices
                        if (currentFrameIndex < 0 || currentFrameIndex >= frames.length || !frames[currentFrameIndex] || nextFrameIndex < 0 || nextFrameIndex >= frames.length || !frames[nextFrameIndex]) {
                            rafRef.current = requestAnimationFrame(step);
                            return;
                        }
                        const keyCurrent = `${frames[currentFrameIndex].url}_${z}_${size.x}_${size.y}`;
                        const keyNext = `${frames[nextFrameIndex].url}_${z}_${size.x}_${size.y}`;
                        // Render current frame to canvas1
                        const currentFrameC = await renderFrameToCanvas(frames[currentFrameIndex], z, size.x, size.y, keyCurrent);
                        if (currentFrameC) {
                            const ctx1 = c1.getContext('2d');
                            if (ctx1) {
                                ctx1.clearRect(0, 0, c1.width, c1.height);
                                ctx1.drawImage(currentFrameC, 0, 0);
                            }
                        }
                        // Render next frame to canvas2
                        const nextFrameC = await renderFrameToCanvas(frames[nextFrameIndex], z, size.x, size.y, keyNext);
                        if (nextFrameC) {
                            const ctx2 = c2.getContext('2d');
                            if (ctx2) {
                                ctx2.clearRect(0, 0, c2.width, c2.height);
                                ctx2.drawImage(nextFrameC, 0, 0);
                            }
                        }
                        // Smooth cross-fade using JavaScript opacity updates (no CSS transitions)
                        const easeInOut = 0.5 - 0.5 * Math.cos(frameBlend * Math.PI);
                        const canvas1Opacity = (1 - easeInOut) * radarOpacity;
                        const canvas2Opacity = easeInOut * radarOpacity;
                        c1.style.opacity = canvas1Opacity.toString();
                        c2.style.opacity = canvas2Opacity.toString();
                        // Ensure both canvases are visible during cross-fade
                        c1.style.display = canvas1Opacity > 0.01 ? 'block' : 'none';
                        c2.style.display = canvas2Opacity > 0.01 ? 'block' : 'none';
                        lastRenderTimeRef.current = now;
                        if (progress >= dur) {
                            progress = 0;
                            radarIndexRef.current = (radarIndexRef.current + 1) % frames.length;
                        }
                    } catch (e) {}
                    rafRef.current = requestAnimationFrame(step);
                }
            }["ResortMap.useEffect.step"];
            rafRef.current = requestAnimationFrame(step);
            return ({
                "ResortMap.useEffect": ()=>{
                    if (rafRef.current) cancelAnimationFrame(rafRef.current);
                }
            })["ResortMap.useEffect"];
        }
    }["ResortMap.useEffect"], [
        radarFramesAvailable
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ResortMap.useEffect": ()=>{
            if (canvasRef.current) canvasRef.current.style.opacity = String(radarOpacity);
            if (canvas2Ref.current) canvas2Ref.current.style.opacity = String(radarOpacity);
        }
    }["ResortMap.useEffect"], [
        radarOpacity
    ]);
    // Prepare resorts with conditions for sidebar
    const resortsWithConditions = resorts.map((resort)=>{
        const cond = conditions[resort.id];
        if (!cond) return null;
        return {
            id: resort.id,
            name: resort.name,
            state: resort.state,
            recentSnowfall: cond.recentSnowfall,
            snowDepth: cond.snowDepth,
            baseTemp: cond.baseTemp
        };
    }).filter(Boolean);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-screen bg-gray-100 flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "flex-1 w-full",
                style: {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: '400px'
                }
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 740,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            radarFramesAvailable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$RadarControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isPlaying: radarPlaying,
                onPlayPause: handlePlayPause,
                opacity: radarOpacity,
                onOpacityChange: setRadarOpacity,
                speed: radarSpeedMs,
                onSpeedChange: setRadarSpeedMs,
                frameCount: frameCount,
                currentFrame: radarIndexRef.current + 1,
                radarSource: radarSource
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 744,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            radarFramesAvailable && radarFramesRef.current.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$RadarTimeline$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                frames: radarFramesRef.current,
                currentFrameIndex: radarIndexRef.current,
                isPlaying: radarPlaying,
                onFrameSelect: handleFrameSelect,
                onPlayPause: handlePlayPause
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 759,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            radarFramesAvailable && currentFrameTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 z-[1000] bg-black/80 text-white px-4 py-2 rounded-lg font-mono text-sm font-bold shadow-lg border border-white/20",
                children: (()=>{
                    const now = Date.now();
                    const diffHours = Math.floor((now - currentFrameTime) / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((now - currentFrameTime) / (1000 * 60)) % 60;
                    if (diffHours === 0 && diffMinutes === 0) return 'NOW';
                    if (diffHours === 0) return `${diffMinutes}m ago`;
                    if (diffHours < 24) return `${diffHours}h ${diffMinutes}m ago`;
                    const diffDays = Math.floor(diffHours / 24);
                    return `${diffDays}d ago`;
                })()
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 770,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            selectedResort && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 z-[99999] bg-white/95 rounded-lg p-5 shadow-lg max-w-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setSelectedResort(null),
                        className: "absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 787,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold text-gray-800 text-base mb-3",
                        children: [
                            "📊 ",
                            selectedResort.resort.name
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 788,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "24h Snowfall:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 791,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-600 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.recentSnowfall,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 792,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 790,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Weekly Total:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 795,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-500 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.weeklySnowfall || 'N/A',
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 796,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 794,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Base Depth:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 799,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.snowDepth,
                                            '"'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 800,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 798,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Temperature:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 803,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-red-600 font-bold text-lg",
                                        children: [
                                            selectedResort.conditions.baseTemp,
                                            "°F"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 804,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 802,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Wind:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 807,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold",
                                        children: [
                                            selectedResort.conditions.windSpeed,
                                            " mph"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 808,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 806,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-semibold",
                                        children: "Visibility:"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 811,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-700 font-bold",
                                        children: selectedResort.conditions.visibility
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ResortMap.tsx",
                                        lineNumber: 812,
                                        columnNumber: 15
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 810,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)),
                            (selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: selectedResort.resort.conditionsUrl || selectedResort.resort.scrapeUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "block mt-4 text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition",
                                children: "View Full Report →"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ResortMap.tsx",
                                lineNumber: 815,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ResortMap.tsx",
                        lineNumber: 789,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 786,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ResortSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                resorts: resortsWithConditions
            }, void 0, false, {
                fileName: "[project]/app/components/ResortMap.tsx",
                lineNumber: 829,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ResortMap.tsx",
        lineNumber: 739,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ResortMap, "xAxi0yxxZXTorIkXeZTkANJAV2E=");
_c = ResortMap;
const __TURBOPACK__default__export__ = ResortMap;
var _c;
__turbopack_context__.k.register(_c, "ResortMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/ResortMap.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/components/ResortMap.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=app_components_e1e1996c._.js.map