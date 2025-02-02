import apiClient from '../middleware/interceptor';

//User cards
export async function paymentCards(token: string, workflowId: string | null): Promise<number | null> {
    try {
        const response = await apiClient.get('/api/users/profile/cards/', {
            headers: {
                'Authorization': `JWT ${token}`,
                'workflow': workflowId
            }
        });

        // Find the card where is_current is true
        const currentCard = response.data.data.results?.find((card: { is_current: boolean }) => card.is_current);

        // Return the card ID if found, otherwise return null
        return currentCard ? currentCard.id : null;
    } catch (error) {
        console.error('Error fetching cards:', error);
        return null;
    }
}

// TimeSlot
export async function closestTimeSlot(workflowId: string | null) {
    try {
        const response = await apiClient.get('/api/deliveries/closest-timeslots/', {
            headers: { 
                'workflow': workflowId,
            }
        });
        return response.data.data?.id;
    } catch (error) {
        console.error('Error fetching timeslot:', error);
        return null;
    }
}

//Checkout before Ordere create
export async function workflowCheckout(workflowId: string | null, token: string, timeslotId: number, paymentCardId: number) : Promise<number|null> {
    try {
        const response = await apiClient.post('/api/orders/workflow/checkout-v2/', 
        {
            delivery: {
                express_selected: false,
                timeslot: {
                    id: timeslotId
                }
            },
            payment_method: "CARD",
            payment_card: {
                id: paymentCardId
            }
        },
        {
            headers: { 
                'Authorization': `JWT ${token}`,
                'workflow': workflowId,
            }   
        });


        
        

        return response.data.data?.total_amount;
    } catch (error) {
        console.error('Error fetching lists:', error);
        return null;
    }
}

export async function orderCreate(workflowId: string | null, token: string) : Promise<number|null> {
    try {
        const response = await apiClient.post('/api/orders/', {},
        {
            headers: { 
                'Authorization': `JWT ${token}`,
                'workflow': workflowId,
            }   
        });

        return response.data.data?.id;
    } catch (error) {
        console.error('Error fetching lists:', error);
        return null;
    }
}


