import { useState } from "react";

const VideoStream = () => {
  const [isError, setIsError] = useState(false);

  return (
    <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
      {isError ? (
        <div className="text-gray-400 text-lg">No video found</div>
      ) : (
        <img
          src="/video"
          alt="Live Camera"
          className="object-contain"
          onError={() => setIsError(true)}
        />
      )}
    </div>
  );
};

export default VideoStream;
