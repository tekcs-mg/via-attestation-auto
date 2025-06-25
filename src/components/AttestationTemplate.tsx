// Fichier : src/components/AttestationTemplate.tsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Définir le type pour les props du composant
type Attestation = {
  numFeuillet: number;
  numeroPolice: string;
  souscripteur: string;
  adresse: string;
  dateEffet: Date;
  dateEcheance: Date;
  usage: string;
  marque: string;
  nombrePlaces: number;
  immatriculation: string;
  dateEdition: Date;
};

// Style en ligne pour le composant, car Tailwind ne sera pas disponible dans le contexte de génération PDF
const styles = {
    page: { fontFamily: 'Arial, sans-serif', fontSize: '10px', width: '800px', border: '1px solid #ddd', padding: '10px', display: 'flex' },
    section: { border: '1px solid #000', padding: '5px' },
    leftSection: { flex: 1.5, borderRight: '1px solid #ddd', paddingRight: '10px' },
    mainSection: { flex: 3, paddingLeft: '10px', paddingRight: '10px' },
    rightSection: { flex: 1.5, borderLeft: '1px solid #ddd', paddingLeft: '10px', textAlign: 'center' as const },
    header: { marginBottom: '10px' },
    label: { color: '#555', display: 'block' },
    value: { fontWeight: 'bold' as const, color: '#000', display: 'block', marginBottom: '5px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '10px' },
    th: { border: '1px solid #000', padding: '4px', textAlign: 'center' as const, backgroundColor: '#eee' },
    td: { border: '1px solid #000', padding: '4px', textAlign: 'center' as const },
    logo: { fontSize: '36px', fontWeight: 'bold' as const, color: '#007bff', marginBottom: '10px' },
    title: { textAlign: 'center' as const, fontWeight: 'bold' as const, fontSize: '12px' }
};

export const AttestationTemplate = ({ attestation }: { attestation: Attestation }) => {
    return (
        <div style={styles.page}>
            {/* --- Section Gauche --- */}
            <div style={styles.leftSection}>
                <div style={styles.header}>
                    <div style={styles.value}>VIA Assurance Madagascar</div>
                    <div style={styles.label}>Masivolva</div>
                </div>
                <div><span style={styles.label}>Fifanekena N° / Police N°</span> <span style={styles.value}>{attestation.numeroPolice}</span></div>
                <div><span style={styles.label}>Fiara N° / Véhicule N°</span> <span style={styles.value}>{attestation.immatriculation}</span></div>
                <div><span style={styles.label}>Mpaka fiantohana</span> <span style={styles.value}>{attestation.souscripteur}</span></div>
                <div><span style={styles.label}>Manan-kery / Valable du</span> <span style={styles.value}>{format(attestation.dateEffet, 'dd/MM/yyyy')}</span></div>
                <div><span style={styles.label}>Ka hatramin'ny / Au</span> <span style={styles.value}>{format(attestation.dateEcheance, 'dd/MM/yyyy')}</span></div>
                <div style={{ marginTop: '20px' }}><span style={styles.label}>Tapakila haverina amin'ny Foibe miaraka amin'ny fifanekena vonjimaika na ny fifanekena</span> <span style={styles.value}>Talon à retourner au siège avec la note de couverture ou la police</span></div>
            </div>

            {/* --- Section Centrale --- */}
            <div style={styles.mainSection}>
                <div style={{...styles.title, ...styles.header}}>
                    <div style={styles.logo}>VIA</div>
                    <div>FANAMARINAM-PIANTOHANA</div>
                    <div>ATTESTATION D'ASSURANCE</div>
                    <div style={{ fontSize: '9px', fontWeight: 'normal' }}>(Loi N°2020-005 du 02 Juin 2020)</div>
                </div>
                <div style={styles.section}>
                    <div><span style={styles.label}>Nomeran'ny fifanekena / N° de la police</span> <span style={styles.value}>{attestation.numeroPolice}</span></div>
                    <div><span style={styles.label}>Mpaka fiantohana / Souscripteur</span> <span style={styles.value}>{attestation.souscripteur}</span></div>
                    <div><span style={styles.label}>Fonenana / Adresse</span> <span style={styles.value}>{attestation.adresse}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div><span style={styles.label}>Manan-kery / Valable du</span><span style={styles.value}>{format(attestation.dateEffet, 'dd MMMM yyyy', { locale: fr })}</span></div>
                        <div><span style={styles.label}>ka hatramin'ny / au</span><span style={styles.value}>{format(attestation.dateEcheance, 'dd MMMM yyyy', { locale: fr })}</span></div>
                    </div>
                </div>
                <div style={{...styles.section, marginTop: '10px'}}>
                    <div style={styles.label}>Fiarakodia iantohana / Véhicule Assuré</div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Karazany / Genre</th>
                                <th style={styles.th}>Anaran'ny karazany / Marque</th>
                                <th style={styles.th}>Nomerao nanoratana / N° d'immatriculation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={styles.td}>{attestation.usage}</td>
                                <td style={styles.td}>{attestation.marque}</td>
                                <td style={styles.td}>{attestation.immatriculation}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Section Droite --- */}
            <div style={styles.rightSection}>
                <div><span style={styles.label}>VIA Assurance Madagascar</span></div>
                <div style={{ marginTop: '10px' }}><span style={styles.label}>MARQUE :</span> <span style={styles.value}>{attestation.marque}</span></div>
                <div><span style={styles.label}>N° IMM :</span> <span style={styles.value}>{attestation.immatriculation}</span></div>
                <div><span style={styles.label}>VALIDITE DU :</span> <span style={styles.value}>{format(attestation.dateEffet, 'dd/MM/yyyy')}</span></div>
                <div><span style={styles.label}>AU :</span> <span style={styles.value}>{format(attestation.dateEcheance, 'dd/MM/yyyy')}</span></div>
                <div style={{ ...styles.section, marginTop: '20px' }}><span style={styles.label}>Tapakila apetaka eo amin'ny fitaratra alohan'ny fiara</span><span style={styles.value}>Volet à apposer sur le pare brise de votre véhicule</span></div>
                <div style={{ marginTop: '20px', fontSize: '8px' }}>Nomena tamin'ny / Délivrée le: {format(attestation.dateEdition, 'dd/MM/yyyy')}</div>
                <div style={{ marginTop: '20px' }}>{/* QR Code Placeholder */}</div>
            </div>
        </div>
    );
};
