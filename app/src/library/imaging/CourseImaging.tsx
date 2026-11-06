/** Relevant real images embedded in each course, with a direct route to practice. */
import { useEffect, useState } from 'react';
import type { RealItem } from '../../scene/imaging/RealExamples';
import { openLibrary } from '../launch';
import { loadImagingStudies, modalityOf, MODALITY_LABEL, sourceFor, studiesForCourse } from './catalog';

export function CourseImaging({ moduleId }: { moduleId: string }) {
  const [studies, setStudies] = useState<RealItem[]>([]);
  useEffect(() => {
    let alive = true;
    loadImagingStudies().then((all) => { if (alive) setStudies(studiesForCourse(all, moduleId)); }).catch(() => {});
    return () => { alive = false; };
  }, [moduleId]);
  if (!studies.length) return null;
  return <section className="lib-course-imaging" aria-label="Real clinical images for this module">
    <div className="lib-row-h">
      <div><h2>See it on real imaging</h2><p>Examples from other patients, not the simulated patient. Assess the image before seeing the answer.</p></div>
      <button className="lib-link" onClick={() => openLibrary({ page: 'imaging', moduleId })}>Practice all {studies.length}</button>
    </div>
    <div className="lib-scroller">
      {studies.slice(0, 5).map((it) => {
        const src = it.poster ?? (it.file.endsWith('.mp4') ? null : it.file);
        return <button className="img-course-thumb" key={it.id}
          onClick={() => openLibrary({ page: 'imaging', moduleId, id: it.id })}>
          <span className="img-course-thumb-picture">
            {src ? <img src={sourceFor(src)} alt="" loading="lazy" decoding="async" /> : <span>Clinical video</span>}
          </span>
          <span><b>{it.title}</b><small>{MODALITY_LABEL[modalityOf(it)!]} · Real patient</small></span>
        </button>;
      })}
    </div>
  </section>;
}
