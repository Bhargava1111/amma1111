import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowLeft } from 'lucide-react';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';
import { env } from '../config/env'; // Import env

// PIN code to city/state mapping for major Indian cities
const PIN_CODE_DATABASE: { [key: string]: { city: string; state: string } } = {
  // Karnataka
  '560001': { city: 'Bangalore', state: 'Karnataka' },
  '560002': { city: 'Bangalore', state: 'Karnataka' },
  '560003': { city: 'Bangalore', state: 'Karnataka' },
  '560004': { city: 'Bangalore', state: 'Karnataka' },
  '560005': { city: 'Bangalore', state: 'Karnataka' },
  '560006': { city: 'Bangalore', state: 'Karnataka' },
  '560007': { city: 'Bangalore', state: 'Karnataka' },
  '560008': { city: 'Bangalore', state: 'Karnataka' },
  '560009': { city: 'Bangalore', state: 'Karnataka' },
  '560010': { city: 'Bangalore', state: 'Karnataka' },
  '560011': { city: 'Bangalore', state: 'Karnataka' },
  '560012': { city: 'Bangalore', state: 'Karnataka' },
  '560013': { city: 'Bangalore', state: 'Karnataka' },
  '560014': { city: 'Bangalore', state: 'Karnataka' },
  '560015': { city: 'Bangalore', state: 'Karnataka' },
  '560016': { city: 'Bangalore', state: 'Karnataka' },
  '560017': { city: 'Bangalore', state: 'Karnataka' },
  '560018': { city: 'Bangalore', state: 'Karnataka' },
  '560019': { city: 'Bangalore', state: 'Karnataka' },
  '560020': { city: 'Bangalore', state: 'Karnataka' },
  '560021': { city: 'Bangalore', state: 'Karnataka' },
  '560022': { city: 'Bangalore', state: 'Karnataka' },
  '560023': { city: 'Bangalore', state: 'Karnataka' },
  '560024': { city: 'Bangalore', state: 'Karnataka' },
  '560025': { city: 'Bangalore', state: 'Karnataka' },
  '560026': { city: 'Bangalore', state: 'Karnataka' },
  '560027': { city: 'Bangalore', state: 'Karnataka' },
  '560028': { city: 'Bangalore', state: 'Karnataka' },
  '560029': { city: 'Bangalore', state: 'Karnataka' },
  '560030': { city: 'Bangalore', state: 'Karnataka' },
  '560040': { city: 'Bangalore', state: 'Karnataka' },
  '560050': { city: 'Bangalore', state: 'Karnataka' },
  '560060': { city: 'Bangalore', state: 'Karnataka' },
  '560070': { city: 'Bangalore', state: 'Karnataka' },
  '560080': { city: 'Bangalore', state: 'Karnataka' },
  '560090': { city: 'Bangalore', state: 'Karnataka' },
  '560100': { city: 'Bangalore', state: 'Karnataka' },
  '570001': { city: 'Mysore', state: 'Karnataka' },
  '580001': { city: 'Hubli', state: 'Karnataka' },
  '575001': { city: 'Mangalore', state: 'Karnataka' },
  
  // Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400002': { city: 'Mumbai', state: 'Maharashtra' },
  '400003': { city: 'Mumbai', state: 'Maharashtra' },
  '400004': { city: 'Mumbai', state: 'Maharashtra' },
  '400005': { city: 'Mumbai', state: 'Maharashtra' },
  '400006': { city: 'Mumbai', state: 'Maharashtra' },
  '400007': { city: 'Mumbai', state: 'Maharashtra' },
  '400008': { city: 'Mumbai', state: 'Maharashtra' },
  '400009': { city: 'Mumbai', state: 'Maharashtra' },
  '400010': { city: 'Mumbai', state: 'Maharashtra' },
  '400011': { city: 'Mumbai', state: 'Maharashtra' },
  '400012': { city: 'Mumbai', state: 'Maharashtra' },
  '400013': { city: 'Mumbai', state: 'Maharashtra' },
  '400014': { city: 'Mumbai', state: 'Maharashtra' },
  '400015': { city: 'Mumbai', state: 'Maharashtra' },
  '400016': { city: 'Mumbai', state: 'Maharashtra' },
  '400017': { city: 'Mumbai', state: 'Maharashtra' },
  '400018': { city: 'Mumbai', state: 'Maharashtra' },
  '400019': { city: 'Mumbai', state: 'Maharashtra' },
  '400020': { city: 'Mumbai', state: 'Maharashtra' },
  '400021': { city: 'Mumbai', state: 'Maharashtra' },
  '400022': { city: 'Mumbai', state: 'Maharashtra' },
  '400023': { city: 'Mumbai', state: 'Maharashtra' },
  '400024': { city: 'Mumbai', state: 'Maharashtra' },
  '400025': { city: 'Mumbai', state: 'Maharashtra' },
  '400026': { city: 'Mumbai', state: 'Maharashtra' },
  '400027': { city: 'Mumbai', state: 'Maharashtra' },
  '400028': { city: 'Mumbai', state: 'Maharashtra' },
  '400029': { city: 'Mumbai', state: 'Maharashtra' },
  '400030': { city: 'Mumbai', state: 'Maharashtra' },
  '400050': { city: 'Mumbai', state: 'Maharashtra' },
  '400060': { city: 'Mumbai', state: 'Maharashtra' },
  '400070': { city: 'Mumbai', state: 'Maharashtra' },
  '400080': { city: 'Mumbai', state: 'Maharashtra' },
  '400090': { city: 'Mumbai', state: 'Maharashtra' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  '411002': { city: 'Pune', state: 'Maharashtra' },
  '411003': { city: 'Pune', state: 'Maharashtra' },
  '411004': { city: 'Pune', state: 'Maharashtra' },
  '411005': { city: 'Pune', state: 'Maharashtra' },
  '411006': { city: 'Pune', state: 'Maharashtra' },
  '411007': { city: 'Pune', state: 'Maharashtra' },
  '411008': { city: 'Pune', state: 'Maharashtra' },
  '411009': { city: 'Pune', state: 'Maharashtra' },
  '411010': { city: 'Pune', state: 'Maharashtra' },
  '411011': { city: 'Pune', state: 'Maharashtra' },
  '411012': { city: 'Pune', state: 'Maharashtra' },
  '411013': { city: 'Pune', state: 'Maharashtra' },
  '411014': { city: 'Pune', state: 'Maharashtra' },
  '411015': { city: 'Pune', state: 'Maharashtra' },
  '411016': { city: 'Pune', state: 'Maharashtra' },
  '411017': { city: 'Pune', state: 'Maharashtra' },
  '411018': { city: 'Pune', state: 'Maharashtra' },
  '411019': { city: 'Pune', state: 'Maharashtra' },
  '411020': { city: 'Pune', state: 'Maharashtra' },
  '440001': { city: 'Nagpur', state: 'Maharashtra' },
  '422001': { city: 'Nashik', state: 'Maharashtra' },
  '431001': { city: 'Aurangabad', state: 'Maharashtra' },
  
  // Delhi
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110002': { city: 'New Delhi', state: 'Delhi' },
  '110003': { city: 'New Delhi', state: 'Delhi' },
  '110004': { city: 'New Delhi', state: 'Delhi' },
  '110005': { city: 'New Delhi', state: 'Delhi' },
  '110006': { city: 'New Delhi', state: 'Delhi' },
  '110007': { city: 'New Delhi', state: 'Delhi' },
  '110008': { city: 'New Delhi', state: 'Delhi' },
  '110009': { city: 'New Delhi', state: 'Delhi' },
  '110010': { city: 'New Delhi', state: 'Delhi' },
  '110011': { city: 'New Delhi', state: 'Delhi' },
  '110012': { city: 'New Delhi', state: 'Delhi' },
  '110013': { city: 'New Delhi', state: 'Delhi' },
  '110014': { city: 'New Delhi', state: 'Delhi' },
  '110015': { city: 'New Delhi', state: 'Delhi' },
  '110016': { city: 'New Delhi', state: 'Delhi' },
  '110017': { city: 'New Delhi', state: 'Delhi' },
  '110018': { city: 'New Delhi', state: 'Delhi' },
  '110019': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi' },
  '110021': { city: 'New Delhi', state: 'Delhi' },
  '110022': { city: 'New Delhi', state: 'Delhi' },
  '110023': { city: 'New Delhi', state: 'Delhi' },
  '110024': { city: 'New Delhi', state: 'Delhi' },
  '110025': { city: 'New Delhi', state: 'Delhi' },
  '110026': { city: 'New Delhi', state: 'Delhi' },
  '110027': { city: 'New Delhi', state: 'Delhi' },
  '110028': { city: 'New Delhi', state: 'Delhi' },
  '110029': { city: 'New Delhi', state: 'Delhi' },
  '110030': { city: 'New Delhi', state: 'Delhi' },
  '110040': { city: 'New Delhi', state: 'Delhi' },
  '110050': { city: 'New Delhi', state: 'Delhi' },
  '110060': { city: 'New Delhi', state: 'Delhi' },
  '110070': { city: 'New Delhi', state: 'Delhi' },
  '110080': { city: 'New Delhi', state: 'Delhi' },
  '110090': { city: 'New Delhi', state: 'Delhi' },
  
  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600002': { city: 'Chennai', state: 'Tamil Nadu' },
  '600003': { city: 'Chennai', state: 'Tamil Nadu' },
  '600004': { city: 'Chennai', state: 'Tamil Nadu' },
  '600005': { city: 'Chennai', state: 'Tamil Nadu' },
  '600006': { city: 'Chennai', state: 'Tamil Nadu' },
  '600007': { city: 'Chennai', state: 'Tamil Nadu' },
  '600008': { city: 'Chennai', state: 'Tamil Nadu' },
  '600009': { city: 'Chennai', state: 'Tamil Nadu' },
  '600010': { city: 'Chennai', state: 'Tamil Nadu' },
  '600011': { city: 'Chennai', state: 'Tamil Nadu' },
  '600012': { city: 'Chennai', state: 'Tamil Nadu' },
  '600013': { city: 'Chennai', state: 'Tamil Nadu' },
  '600014': { city: 'Chennai', state: 'Tamil Nadu' },
  '600015': { city: 'Chennai', state: 'Tamil Nadu' },
  '600016': { city: 'Chennai', state: 'Tamil Nadu' },
  '600017': { city: 'Chennai', state: 'Tamil Nadu' },
  '600018': { city: 'Chennai', state: 'Tamil Nadu' },
  '600019': { city: 'Chennai', state: 'Tamil Nadu' },
  '600020': { city: 'Chennai', state: 'Tamil Nadu' },
  '641001': { city: 'Coimbatore', state: 'Tamil Nadu' },
  '625001': { city: 'Madurai', state: 'Tamil Nadu' },
  '620001': { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  
  // West Bengal
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700002': { city: 'Kolkata', state: 'West Bengal' },
  '700003': { city: 'Kolkata', state: 'West Bengal' },
  '700004': { city: 'Kolkata', state: 'West Bengal' },
  '700005': { city: 'Kolkata', state: 'West Bengal' },
  '700006': { city: 'Kolkata', state: 'West Bengal' },
  '700007': { city: 'Kolkata', state: 'West Bengal' },
  '700008': { city: 'Kolkata', state: 'West Bengal' },
  '700009': { city: 'Kolkata', state: 'West Bengal' },
  '700010': { city: 'Kolkata', state: 'West Bengal' },
  '700011': { city: 'Kolkata', state: 'West Bengal' },
  '700012': { city: 'Kolkata', state: 'West Bengal' },
  '700013': { city: 'Kolkata', state: 'West Bengal' },
  '700014': { city: 'Kolkata', state: 'West Bengal' },
  '700015': { city: 'Kolkata', state: 'West Bengal' },
  '700016': { city: 'Kolkata', state: 'West Bengal' },
  '700017': { city: 'Kolkata', state: 'West Bengal' },
  '700018': { city: 'Kolkata', state: 'West Bengal' },
  '700019': { city: 'Kolkata', state: 'West Bengal' },
  '700020': { city: 'Kolkata', state: 'West Bengal' },
  '711101': { city: 'Howrah', state: 'West Bengal' },
  
  // Telangana
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  '500002': { city: 'Hyderabad', state: 'Telangana' },
  '500003': { city: 'Hyderabad', state: 'Telangana' },
  '500004': { city: 'Hyderabad', state: 'Telangana' },
  '500005': { city: 'Hyderabad', state: 'Telangana' },
  '500006': { city: 'Hyderabad', state: 'Telangana' },
  '500007': { city: 'Hyderabad', state: 'Telangana' },
  '500008': { city: 'Hyderabad', state: 'Telangana' },
  '500009': { city: 'Hyderabad', state: 'Telangana' },
  '500010': { city: 'Hyderabad', state: 'Telangana' },
  '500011': { city: 'Hyderabad', state: 'Telangana' },
  '500012': { city: 'Hyderabad', state: 'Telangana' },
  '500013': { city: 'Hyderabad', state: 'Telangana' },
  '500014': { city: 'Hyderabad', state: 'Telangana' },
  '500015': { city: 'Hyderabad', state: 'Telangana' },
  '500016': { city: 'Hyderabad', state: 'Telangana' },
  '500017': { city: 'Hyderabad', state: 'Telangana' },
  '500018': { city: 'Hyderabad', state: 'Telangana' },
  '500019': { city: 'Hyderabad', state: 'Telangana' },
  '500020': { city: 'Hyderabad', state: 'Telangana' },
  '506001': { city: 'Warangal', state: 'Telangana' },
  
  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '380002': { city: 'Ahmedabad', state: 'Gujarat' },
  '380003': { city: 'Ahmedabad', state: 'Gujarat' },
  '380004': { city: 'Ahmedabad', state: 'Gujarat' },
  '380005': { city: 'Ahmedabad', state: 'Gujarat' },
  '380006': { city: 'Ahmedabad', state: 'Gujarat' },
  '380007': { city: 'Ahmedabad', state: 'Gujarat' },
  '380008': { city: 'Ahmedabad', state: 'Gujarat' },
  '380009': { city: 'Ahmedabad', state: 'Gujarat' },
  '380010': { city: 'Ahmedabad', state: 'Gujarat' },
  '380011': { city: 'Ahmedabad', state: 'Gujarat' },
  '380012': { city: 'Ahmedabad', state: 'Gujarat' },
  '380013': { city: 'Ahmedabad', state: 'Gujarat' },
  '380014': { city: 'Ahmedabad', state: 'Gujarat' },
  '380015': { city: 'Ahmedabad', state: 'Gujarat' },
  '380016': { city: 'Ahmedabad', state: 'Gujarat' },
  '380017': { city: 'Ahmedabad', state: 'Gujarat' },
  '380018': { city: 'Ahmedabad', state: 'Gujarat' },
  '380019': { city: 'Ahmedabad', state: 'Gujarat' },
  '380020': { city: 'Ahmedabad', state: 'Gujarat' },
  '395001': { city: 'Surat', state: 'Gujarat' },
  '390001': { city: 'Vadodara', state: 'Gujarat' },
  '360001': { city: 'Rajkot', state: 'Gujarat' },
  
  // Rajasthan
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '302002': { city: 'Jaipur', state: 'Rajasthan' },
  '302003': { city: 'Jaipur', state: 'Rajasthan' },
  '302004': { city: 'Jaipur', state: 'Rajasthan' },
  '302005': { city: 'Jaipur', state: 'Rajasthan' },
  '302006': { city: 'Jaipur', state: 'Rajasthan' },
  '302007': { city: 'Jaipur', state: 'Rajasthan' },
  '302008': { city: 'Jaipur', state: 'Rajasthan' },
  '302009': { city: 'Jaipur', state: 'Rajasthan' },
  '302010': { city: 'Jaipur', state: 'Rajasthan' },
  '302011': { city: 'Jaipur', state: 'Rajasthan' },
  '302012': { city: 'Jaipur', state: 'Rajasthan' },
  '302013': { city: 'Jaipur', state: 'Rajasthan' },
  '302014': { city: 'Jaipur', state: 'Rajasthan' },
  '302015': { city: 'Jaipur', state: 'Rajasthan' },
  '302016': { city: 'Jaipur', state: 'Rajasthan' },
  '302017': { city: 'Jaipur', state: 'Rajasthan' },
  '302018': { city: 'Jaipur', state: 'Rajasthan' },
  '302019': { city: 'Jaipur', state: 'Rajasthan' },
  '302020': { city: 'Jaipur', state: 'Rajasthan' },
  '342001': { city: 'Jodhpur', state: 'Rajasthan' },
  '313001': { city: 'Udaipur', state: 'Rajasthan' },
  '324001': { city: 'Kota', state: 'Rajasthan' },
  
  // Punjab
  '160001': { city: 'Chandigarh', state: 'Punjab' },
  '160002': { city: 'Chandigarh', state: 'Punjab' },
  '160003': { city: 'Chandigarh', state: 'Punjab' },
  '160004': { city: 'Chandigarh', state: 'Punjab' },
  '160005': { city: 'Chandigarh', state: 'Punjab' },
  '160006': { city: 'Chandigarh', state: 'Punjab' },
  '160007': { city: 'Chandigarh', state: 'Punjab' },
  '160008': { city: 'Chandigarh', state: 'Punjab' },
  '160009': { city: 'Chandigarh', state: 'Punjab' },
  '160010': { city: 'Chandigarh', state: 'Punjab' },
  '141001': { city: 'Ludhiana', state: 'Punjab' },
  '143001': { city: 'Amritsar', state: 'Punjab' },
  '144001': { city: 'Jalandhar', state: 'Punjab' },
  
  // Haryana
  '122001': { city: 'Gurugram', state: 'Haryana' },
  '121001': { city: 'Faridabad', state: 'Haryana' },
  '132001': { city: 'Panipat', state: 'Haryana' },
  '134001': { city: 'Ambala', state: 'Haryana' },
  
  // Kerala
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala' },
  '682001': { city: 'Kochi', state: 'Kerala' },
  '673001': { city: 'Kozhikode', state: 'Kerala' },
  '680001': { city: 'Thrissur', state: 'Kerala' },
  
  // Uttar Pradesh
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh' },
  '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh' },
  '282001': { city: 'Agra', state: 'Uttar Pradesh' },
  '221001': { city: 'Varanasi', state: 'Uttar Pradesh' },
  '250001': { city: 'Meerut', state: 'Uttar Pradesh' },
  
  // Andhra Pradesh
  '530001': { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  '520001': { city: 'Vijayawada', state: 'Andhra Pradesh' },
  '522001': { city: 'Guntur', state: 'Andhra Pradesh' },
  
  // Odisha
  '751001': { city: 'Bhubaneswar', state: 'Odisha' },
  '753001': { city: 'Cuttack', state: 'Odisha' },
  
  // Jharkhand
  '834001': { city: 'Ranchi', state: 'Jharkhand' },
  '831001': { city: 'Jamshedpur', state: 'Jharkhand' },
  
  // Bihar
  '800001': { city: 'Patna', state: 'Bihar' },
  '823001': { city: 'Gaya', state: 'Bihar' },
  
  // Assam
  '781001': { city: 'Guwahati', state: 'Assam' },
  '788001': { city: 'Silchar', state: 'Assam' },
  
  // Chhattisgarh
  '492001': { city: 'Raipur', state: 'Chhattisgarh' },
  '490001': { city: 'Durg', state: 'Chhattisgarh' },
  
  // Himachal Pradesh
  '171001': { city: 'Shimla', state: 'Himachal Pradesh' },
  '176001': { city: 'Dharamshala', state: 'Himachal Pradesh' },
  
  // Uttarakhand
  '248001': { city: 'Dehradun', state: 'Uttarakhand' },
  '249401': { city: 'Haridwar', state: 'Uttarakhand' },
  
  // Goa
  '403001': { city: 'Panaji', state: 'Goa' },
  '403601': { city: 'Margao', state: 'Goa' },
  
  // Madhya Pradesh
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh' },
  '452001': { city: 'Indore', state: 'Madhya Pradesh' },
  '474001': { city: 'Gwalior', state: 'Madhya Pradesh' }
};

// Indian states data
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

// Major Indian cities by state
const CITIES_BY_STATE: { [key: string]: string[] } = {
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
  'Delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Brahmapur', 'Sambalpur'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Kashipur'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar']
};

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Singapore', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait'
];

const CheckoutPage: React.FC = () => {
  const { items, totalPrice, clearCart, addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.Name || '',
    email: user?.Email || '',
    phone: user?.PhoneNumber || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Convert price to rupees (prices are already in INR)
  const convertToRupees = (price: number): number => {
    return price; // Already in INR
  };

  // Prices are already in INR, no conversion needed
  const totalPriceInRupees = totalPrice;
  const shipping = totalPriceInRupees > 999 ? 0 : 99; // Free shipping over ₹999, otherwise ₹99
  const tax = totalPriceInRupees * 0.18; // 18% GST in India
  const finalTotal = totalPriceInRupees + shipping + tax;
  
  console.log('Checkout calculations:', {
    totalPrice,
    totalPriceInRupees,
    shipping,
    tax,
    finalTotal
  });

  // Get cities for selected state
  const getCitiesForState = (state: string) => {
    return CITIES_BY_STATE[state] || [];
  };

  // Lookup city and state by PIN code
  const lookupByPinCode = (pinCode: string) => {
    if (pinCode.length === 6 && /^\d{6}$/.test(pinCode)) {
      const locationData = PIN_CODE_DATABASE[pinCode];
      if (locationData) {
        return locationData;
      }
    }
    return null;
  };

  // Handle PIN code change and auto-populate city/state
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pinCode = e.target.value;
    
    // Update PIN code in state
    setShippingInfo({ ...shippingInfo, zipCode: pinCode });
    
    // If country is India and PIN code is valid, lookup city/state
    if (shippingInfo.country === 'India') {
      const locationData = lookupByPinCode(pinCode);
      if (locationData) {
        setShippingInfo(prev => ({
          ...prev,
          zipCode: pinCode,
          city: locationData.city,
          state: locationData.state
        }));
        
        toast({
          title: "Location Auto-filled",
          description: `City: ${locationData.city}, State: ${locationData.state}`,
          duration: 3000
        });
      }
    }
  };

  useEffect(() => {
    // Load Razer Pay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const displayRazerPay = async () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);

    try {
      // Validate payment amount
      const amountValidation = PaymentService.validateAmount(finalTotal);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
      }

      // Show processing message
      toast({
        title: "Processing Payment",
        description: "Preparing your order for payment...",
      });

      // 1. Create an order using OrderService (this creates internal order and Razorpay order)
      const orderResponse = await OrderService.createRazerPayOrder({
        amount: finalTotal,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        userId: user.ID,
        cartItems: items,
        shippingAddress: shippingInfo,
      });

      if (!orderResponse.success || !orderResponse.razerpayOrderId) {
        throw new Error(orderResponse.message || 'Failed to create order.');
      }

      // 2. Use PaymentService to handle the payment flow
      await PaymentService.openCheckout({
        amount: finalTotal,
        currency: 'INR',
        orderId: orderResponse.razerpayOrderId,
        customerInfo: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: user.PhoneNumber || shippingInfo.phone || ''
        },
        orderItems: items,
        shippingAddress: shippingInfo,
        onSuccess: async (response) => {
          try {
            // 3. Verify payment
            const verificationResponse = await OrderService.verifyRazerPayPayment({
              razerpay_payment_id: response.razorpay_payment_id,
              razerpay_order_id: response.razorpay_order_id,
              razerpay_signature: response.razorpay_signature,
              orderId: orderResponse.orderId,
            });

            if (verificationResponse.success) {
              clearCart();
              toast({
                title: "Order Placed Successfully! 🎉",
                description: `Your order #${orderResponse.orderId} has been confirmed and is being processed.`
              });
              navigate(`/order-confirmation/${orderResponse.orderId}`);
            } else {
              toast({
                title: "Payment Verification Failed",
                description: verificationResponse.message || "Payment could not be verified. Please contact support.",
                variant: "destructive"
              });
            }
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError);
            toast({
              title: "Verification Error",
              description: verifyError.message || "Failed to verify payment. Please contact support.",
              variant: "destructive"
            });
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          
          if (error.message?.includes('cancelled')) {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Your order has not been placed.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Payment Failed",
              description: error.message || "Payment failed. Please try again.",
              variant: "destructive"
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address || 
        !shippingInfo.country || !shippingInfo.state || !shippingInfo.city || !shippingInfo.zipCode) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required shipping information.",
        variant: "destructive"
      });
      return;
    }
    
    displayRazerPay();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to proceed with checkout
            </p>
            <Button asChild>
              <a href="/login?redirect=/checkout">Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before checking out
            </p>
            <div className="flex flex-col gap-4">
              <Button asChild>
                <a href="/products">Continue Shopping</a>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Add demo items to cart for testing
                  const demoItem = {
                    id: '1',
                    name: 'Demo Product',
                    price: 29.99,
                    image: '/placeholder.svg',
                    category: 'Demo'
                  };
                  addToCart(demoItem);
                  addToCart(demoItem);
                  toast({
                    title: "Demo Items Added",
                    description: "Added 2 demo items to your cart for testing"
                  });
                }}
              >
                Add Demo Items (for testing)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
          <Button variant="outline" onClick={() => navigate('/cart')} className="self-start sm:self-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingInfo.fullName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="House/Flat No., Street, Area"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={shippingInfo.country} 
                        onValueChange={(value) => setShippingInfo({ ...shippingInfo, country: value, state: '', city: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select 
                        value={shippingInfo.state} 
                        onValueChange={(value) => setShippingInfo({ ...shippingInfo, state: value, city: '' })}
                        disabled={shippingInfo.country !== 'India'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingInfo.country === 'India' ? 
                            INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            )) : 
                            <SelectItem value="other">Other</SelectItem>
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      {shippingInfo.country === 'India' && shippingInfo.state ? (
                        <Select 
                          value={shippingInfo.city} 
                          onValueChange={(value) => setShippingInfo({ ...shippingInfo, city: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            {getCitiesForState(shippingInfo.state).map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                      <Input
                        id="city"
                          placeholder="Enter City"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                      />
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">
                        {shippingInfo.country === 'India' ? 'PIN Code' : 'ZIP Code'}
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder={shippingInfo.country === 'India' ? "Enter PIN Code" : "Enter ZIP Code"}
                        value={shippingInfo.zipCode}
                        onChange={handlePinCodeChange}
                        required
                        maxLength={shippingInfo.country === 'India' ? 6 : 10}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information - Replaced by Razorpay */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Click "Place Order" to proceed with Razorpay. You will be redirected to a secure payment page.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(convertToRupees(item.price) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{totalPriceInRupees.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${shipping.toFixed(0)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (GST 18%)</span>
                      <span className="font-medium">₹{tax.toFixed(0)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(0)}</span>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Place Order - ₹${finalTotal.toFixed(0)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Your payment information is secure and encrypted
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

