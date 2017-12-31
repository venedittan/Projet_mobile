import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Injectable()
export class CustomerService {

  deliveryAddresses : FirebaseListObservable<any>;
  constructor(public db: AngularFireDatabase) {}
  
  loadDeliveyAddress(userid : string)  {
     this.deliveryAddresses = this.db.list(`customer/${userid}/address`);
  };

  addAddress(userid : string, address : any){
   
    this.loadDeliveyAddress(userid);
    this.deliveryAddresses.push(address);

  };
  
}