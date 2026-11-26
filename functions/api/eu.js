import { USUARIOS, json } from '../../painel/servidor.js';

export const onRequestGet = ({ data }) => json({ usuario: data.usuario, ...USUARIOS[data.usuario] });
