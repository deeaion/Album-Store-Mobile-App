import { IonHeader, IonTitle, IonToolbar } from "@ionic/react"

export const Header = () => {
    return (
        <IonHeader>
            <IonToolbar style ={{
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
            }}>
                <IonTitle style={{
                   
                }}>Beat Bliss</IonTitle>
            </IonToolbar>
        </IonHeader>
    );
};

