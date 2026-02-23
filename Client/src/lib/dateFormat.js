export const dateFormat = (date) =>{
    return new Date(date).toLocaleDateString('en-Us',{
        weekday:'short',
        month:'long',
        day:'numeric',
        hour:'numeric',
        minute:'numeric'
    })
}