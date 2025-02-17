import { useState } from "react";
import { Upload } from "lucide-react";
import axios from "axios";

export default function CourseForm() {
  const [courseName, setCourseName] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [modules, setModules] = useState([
    { title: "", video: "", description: "" },
  ]);

  // Add new module to the list
  const addModule = () => {
    setModules([...modules, { title: "", video: null, description: "" }]);
  };

  // Handle course image upload
  const handleImageUpload = (event) => {
    setCourseImage(event.target.files[0]);
  };

  // Handle module changes (title, description, and video)
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...modules];
    updatedModules[index][field] = value;
    setModules(updatedModules);
  };

  // Handle video upload for a module
  const handleVideoUpload = (index, event) => {
    const videoFile = event.target.files[0];
    if (videoFile) {
      handleModuleChange(index, "video", videoFile);  
    }
  };

  // Handle form submission (e.g., sending data to the backend)
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!courseImage) {
      alert("Please upload a course image");
      return;
    }
    if (modules.some((module) => !module.video)) {
      alert("Please upload a video for each module");
      return;
    }
  
    const formData = new FormData();
    formData.append("courseName", courseName);
    formData.append("courseImage", courseImage);
  
    // Send the modules array without the video field
    const modulesWithoutVideos = modules.map((module) => ({
      title: module.title,
      description: module.description,
    }));
    formData.append("modules", JSON.stringify(modulesWithoutVideos));
  
    // Append each module's video file separately
    modules.forEach((module, index) => {
      formData.append(`modules[${index}][video]`, module.video);
    });
  
    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await axios.post(
        "http://localhost:5000/course/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 201) {
        alert("Course created successfully");
        setCourseName("");
        setCourseImage(null);
        setModules([{ title: "", video: null, description: "" }]);
      }
    } catch (error) {
      console.error("Error creating course", error);
      alert("Error creating course. Please check the console for details.");
    }
  };

  return (
    <div className="course-form-container">
      <h2>Create a Course</h2>

      <form onSubmit={handleSubmit}>
        {/* Course Name */}
        <input
          type="text"
          placeholder="Course Name"
          className="input-field"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
        />

        {/* Course Image Upload */}
        <div>
          <label>Course Image</label>
          <input
            type="file"
            accept="image/*"
            className="input-field"
            onChange={handleImageUpload}
            required
          />
        </div>

        {/* Modules Section */}
        <div className="modules-container">
          {modules.map((module, index) => (
            <div key={index} className="module-card">
              {/* Module Title */}
              <input
                type="text"
                placeholder="Module Title"
                className="input-field"
                value={module.title}
                onChange={(e) =>
                  handleModuleChange(index, "title", e.target.value)
                }
                required
              />

              {/* Video Upload */}
              <div>
                <label>Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  className="input-field"
                  onChange={(e) => handleVideoUpload(index, e)}
                  required
                />
              </div>

              {/* Module Description */}
              <textarea
                placeholder="Module Description"
                className="input-field"
                value={module.description}
                onChange={(e) =>
                  handleModuleChange(index, "description", e.target.value)
                }
                required
              />
            </div>
          ))}
        </div>

        {/* Add Module Button */}
        <button type="button" onClick={addModule} className="add-module-button">
          <Upload size={16} /> Add Module
        </button>

        {/* Course Preview */}
        <div className="course-preview">
          {courseImage && (
            <img
              src={URL.createObjectURL(courseImage)}
              alt="Course"
              className="course-image"
            />
          )}
          <h3>{courseName}</h3>
        </div>

        {/* Syllabus Preview */}
        <h3>Syllabus</h3>
        <div className="syllabus-container">
          {modules.map((module, index) => (
            <div key={index} className="syllabus-module">
              <h4>{module.title || "Module Title"}</h4>
              {module.video && (
                <video
                  controls
                  src={URL.createObjectURL(module.video)}
                  className="module-video"
                />
              )}
              <p>{module.description || "Module Description"}</p>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">
          Create Course
        </button>
      </form>
    </div>
  );
}
