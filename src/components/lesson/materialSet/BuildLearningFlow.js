export const buildSequentialContent = (materialSet) => {
    const sequence = [];
    materialSet.subtopicSections.forEach((section) => {
      const { subtopicTitle } = section;
  
      section.videos?.forEach((video) =>
        sequence.push({
          type: "VIDEO",
          id: video.idVideo,
          label: `Video: ${video.videoTitle}`,
          subtopicTitle,
        })
      );
  
      section.notes?.forEach((note) =>
        sequence.push({
          type: "NOTE",
          id: note.idMaterialNote,
          label: `Nota: ${note.noteTitle}`,
          subtopicTitle,
        })
      );
  
      if (section.exerciseSet?.exerciseSet) {
        sequence.push({
          type: "QUIZ",
          id: section.exerciseSet.exerciseSet.idExerciseSet,
          label: `Kuiz: ${section.exerciseSet.exerciseSet.exerciseTitle}`,
          subtopicTitle,
        });
      }
    });
  
    return sequence;
  };
  