import { Component } from '@angular/core';
import { CompareService } from '../../services/compare.service';
@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['compare.component.scss']
})

export class CompareComponent  {

  constructor(private cs: CompareService) {

  }

  
}
