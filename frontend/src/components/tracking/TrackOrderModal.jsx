import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function TrackOrderModal({ isOpen, onClose, backendOrderId, trackingSteps, currentStatusIndex, deliveryStatus, trackingUrl, courier }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full relative overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors z-10">
              <X size={24} />
            </button>
            <div className="p-8 max-h-[85vh] overflow-y-auto">
              {!backendOrderId ? (
                <div className="text-center py-20">
                  <p className="text-lg font-semibold text-neutral-600">
                    No active order to track
                  </p>
                  <p className="text-neutral-500 mt-1">Place an order to see its live progress here.</p>
                </div>
              ) : (
                <>
                  {/* Tracking Progress Bar */}
                  <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 tracking-tight">
                        Your Order is in Motion!
                      </h2>
                      <p className="text-neutral-500 mt-2">
                        Order ID:{" "}
                        <span className="font-mono bg-neutral-100 text-neutral-700 px-2 py-1 rounded-md text-sm">
                          #{backendOrderId}
                        </span>
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-6 w-full h-1.5 bg-neutral-200 rounded-full">
                        <motion.div
                          className="h-1.5 bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(0, (currentStatusIndex / (trackingSteps.length - 1)) * 100)}%` }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                      </div>
                      <div className="flex justify-between relative z-10">
                        {trackingSteps.map((step, idx) => {
                          const isCompleted = currentStatusIndex >= 0 && idx <= currentStatusIndex;
                          const isCurrent = idx === currentStatusIndex;
                          return (
                            <div key={step.key} className="flex flex-col items-center text-center w-24 md:w-36">
                              <motion.div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${isCompleted ? "bg-blue-500 border-blue-600" : "bg-white border-neutral-300"}`}
                                animate={{ scale: isCurrent ? 1.15 : 1 }}
                                transition={{ type: "spring" }}
                              >
                                <step.icon size={24} className={isCompleted ? "text-white" : "text-neutral-400"}/>
                              </motion.div>
                              <p className={`mt-4 text-xs md:text-sm font-semibold transition-colors duration-500 ${isCompleted ? "text-neutral-800" : "text-neutral-500"}`}>
                                {step.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  {/* Order Details & Courier Info */}
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="p-5 border rounded-lg bg-neutral-50">
                        <h3 className="font-bold text-lg mb-3">Order Summary</h3>
                        <p><span className="font-semibold">Order Status:</span> {deliveryStatus || "Waiting for details..."}</p>
                        {trackingUrl && (
                            <p>
                                <span className="font-semibold">Live Tracking:</span>{" "}
                                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                    View on Map
                                </a>
                            </p>
                        )}
                    </div>
                    <div className="p-5 border rounded-lg bg-neutral-50">
                        <h3 className="font-bold text-lg mb-3">Courier Details</h3>
                        {courier ? (
                            <div>
                                <p><span className="font-semibold">Rider:</span> {courier.name} {courier.surname}</p>
                                <p>
                                    <span className="font-semibold">Phone:</span>{" "}
                                    <a href={`tel:${courier.phone}`} className="text-blue-600 underline hover:text-blue-800">
                                        {courier.phone}
                                    </a>
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">Waiting for courier assignment...</p>
                        )}
                    </div>
                  </div>
                  {courier?.latitude && courier?.longitude && (
                        <div className="mt-6">
                            <iframe
                                title="Courier Location"
                                width="100%"
                                height="300"
                                className="rounded-lg border"
                                src={`https://maps.google.com/maps?q=${courier.latitude},${courier.longitude}&z=15&output=embed`}
                            ></iframe>
                        </div>
                    )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

