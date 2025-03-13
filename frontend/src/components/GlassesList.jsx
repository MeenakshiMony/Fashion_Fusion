import { useEffect, useState } from "react";
import axios from '../utils/axios';
import { ChevronLeft, ChevronRight } from "lucide-react"; 

const GlassesList = ({ onSelectGlasses }) => {
    const [glassesList, setGlassesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/glasses")
            .then((response) => {
                console.log("Glasses API Response:", response.data); 
                setGlassesList(response.data);
            })
            .catch((error) => {
                console.error("Failed to fetch glasses data:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleGlassesClick = (glasses) => {
        onSelectGlasses(glasses);
    };


    if (loading) return <p>Loading glasses...</p>;

    return (
        <div className="glasses-slider">

            {/* Glasses List */}
            <div id="glasses-list" className="glasses-list">
                {glassesList.map((glasses) => (
                    <div 
                        key={glasses.id} 
                        className="glasses-item"
                        onClick={() => handleGlassesClick(glasses)}
                    >
                        <img 
                            src={glasses.image} 
                            alt={glasses.name}
                            className="glasses-thumbnail"
                            data-3d-type={glasses.data.type} 
                            data-3d-model-path={glasses.data.modelPath}
                            data-3d-model={glasses.data.model}
                            data-3d-x={glasses.data.x}
                            data-3d-y={glasses.data.y}
                            data-3d-z={glasses.data.z}
                            data-3d-up={glasses.data.up}
                            data-3d-scale={glasses.data.scale}
                        />
                    </div>
                ))}
            </div>

        </div>
    );
};

export default GlassesList;
