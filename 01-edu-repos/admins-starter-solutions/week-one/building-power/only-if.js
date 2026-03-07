if (truth) {
    console.log('The truth was spoken.');
} else {
    console.log('Lies !!!!');
}

ticket = 'You cannot benefit from our special promotion.';
if (user.age >= 18 && user.age <= 25 && user.activeMembership) {
    ticket = 'You can benefit from our special promotion.';
}

if (customer.cash >= 9.99 || customer.hasVoucher) {
    ticketSold += 1;
}
