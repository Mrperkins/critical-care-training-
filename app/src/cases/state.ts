import {create} from 'zustand';
import {useUI} from '../app/store';
interface CaseUI {selected:string|null;lesson:string|null;disease:string|null;set:(p:Partial<CaseUI>)=>void}
export const useCases=create<CaseUI>(set=>({selected:null,lesson:null,disease:null,set:p=>set(p)}));
export function openConference(id:string|null,context:{lesson?:string;disease?:string}={}){
  useCases.getState().set({selected:id,lesson:context.lesson??null,disease:context.disease??null});
  useUI.getState().set({module:'cases',atlasDisease:null});
}
