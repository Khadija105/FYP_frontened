import React, { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card } from "../components/ui";
import { ROOM_IMAGES, MOCK_ARTWORKS } from "../data/mockData";

const RoomMockup: React.FC = () => {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [selectedArtworkIdx, setSelectedArtworkIdx] = useState(0);
  const [artworkSize, setArtworkSize] = useState(150);
  const [artworkX, setArtworkX] = useState(50);
  const [artworkY, setArtworkY] = useState(50);

  const selectedRoom = ROOM_IMAGES[selectedRoomIdx];
  const selectedArtwork = MOCK_ARTWORKS[selectedArtworkIdx];

  return (
    <MainLayout>
      <PageContainer className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Room Mockup Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Visualize how artwork looks in your space
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <Card className="p-0 overflow-hidden">
              <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {/* Room Image */}
                <motion.img
                  key={selectedRoom}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={selectedRoom}
                  alt="Room"
                  className="w-full h-full object-cover"
                />

                {/* Artwork Overlay */}
                <motion.div
                  className="absolute cursor-move"
                  style={{
                    left: `${artworkX}%`,
                    top: `${artworkY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => {
                    const containerRect = document.querySelector(".preview-container") as HTMLElement;
                    if (containerRect) {
                      setArtworkX(
                        Math.max(
                          0,
                          Math.min(100, artworkX + (info.delta.x / containerRect.offsetWidth) * 100)
                        )
                      );
                      setArtworkY(
                        Math.max(
                          0,
                          Math.min(100, artworkY + (info.delta.y / containerRect.offsetHeight) * 100)
                        )
                      );
                    }
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)" }}
                >
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    className="rounded-lg border-4 border-white shadow-2xl"
                    style={{
                      width: artworkSize,
                      height: artworkSize,
                      objectFit: "cover",
                    }}
                  />
                  {/* Frame Info */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-12 left-0 right-0 text-center bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
                  >
                    {artworkSize}x{artworkSize}px - {selectedArtwork.title}
                  </motion.div>
                </motion.div>
              </div>

              {/* Size Slider */}
              <div className="preview-container p-6 bg-gray-50 dark:bg-gray-700">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Artwork Size: {artworkSize}px
                </label>
                <motion.input
                  type="range"
                  min="50"
                  max="300"
                  value={artworkSize}
                  onChange={(e) => setArtworkSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <span>50px</span>
                  <span>300px</span>
                </div>

                {/* Position Info */}
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Position X: <span className="font-bold">{Math.round(artworkX)}%</span>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Position Y: <span className="font-bold">{Math.round(artworkY)}%</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setArtworkX(50);
                      setArtworkY(50);
                      setArtworkSize(150);
                    }}
                  >
                    Reset
                  </Button>
                  <Button size="sm" className="flex-1">
                    Save Layout
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Controls Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Room Selection */}
            <Card>
              <h3 className="font-bold mb-4">Select Room</h3>
              <div className="grid grid-cols-2 gap-3">
                {ROOM_IMAGES.map((room, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRoomIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedRoomIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-400"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <img src={room} alt={`Room ${idx + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Artwork Selection */}
            <Card>
              <h3 className="font-bold mb-4">Select Artwork</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {MOCK_ARTWORKS.map((art, idx) => (
                  <motion.button
                    key={art.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedArtworkIdx(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedArtworkIdx === idx
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <p className="font-semibold text-sm truncate">{art.title}</p>
                    <p className={`text-xs ${selectedArtworkIdx === idx ? "text-indigo-100" : "text-gray-600 dark:text-gray-400"}`}>
                      by {art.artist.name}
                    </p>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Quick Positioning */}
            <Card>
              <h3 className="font-bold mb-4">Quick Position</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { x: 20, y: 30, label: "Top Left" },
                  { x: 50, y: 30, label: "Top Center" },
                  { x: 80, y: 30, label: "Top Right" },
                  { x: 20, y: 50, label: "Mid Left" },
                  { x: 50, y: 50, label: "Center" },
                  { x: 80, y: 50, label: "Mid Right" },
                  { x: 20, y: 70, label: "Bottom Left" },
                  { x: 50, y: 70, label: "Bottom" },
                  { x: 80, y: 70, label: "Bottom Right" },
                ].map((pos, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setArtworkX(pos.x);
                      setArtworkY(pos.y);
                    }}
                    className="p-2 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    {pos.label.split(" ")[0]}
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Current Artwork Info */}
            <Card>
              <h3 className="font-bold mb-4">Current Artwork</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Title</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedArtwork.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Artist</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedArtwork.artist.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Price</p>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    ${selectedArtwork.price.toLocaleString()}
                  </p>
                </div>
                <Button size="sm" className="w-full mt-3">
                  Add to Cart
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800"
        >
          <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3">
            💡 Pro Tips
          </h3>
          <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-2">
            <li>• Drag the artwork to reposition it on the wall</li>
            <li>• Use the slider to adjust the size and preview different scales</li>
            <li>• Try quick position buttons to find the perfect placement</li>
            <li>• Switch between rooms to see how the artwork fits in different spaces</li>
          </ul>
        </motion.div>
      </PageContainer>
    </MainLayout>
  );
};

export default RoomMockup;
