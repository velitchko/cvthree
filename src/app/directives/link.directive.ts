import {Directive, HostListener, Input} from '@angular/core'
import {Router} from '@angular/router'
import * as _ from 'lodash'
import * as qs from 'qs'

@Directive({
  selector: '[link]'
})
export class LinkDirective {
  @Input() link: string

  @HostListener('click', ['$event'])
  onClick($event) {
    // ctrl+click, cmd+click
  //  if ($event.ctrlKey || $event.metaKey) {
      $event.preventDefault()
      $event.stopPropagation()
      window.open(this.getUrl(this.link), '_blank')
    // } else {
    //   this.router.navigate(this.getLink(this.link))
    // }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp($event) {
    // middleclick
    if ($event.which == 2) {
      $event.preventDefault()
      $event.stopPropagation()
      window.open(this.getUrl(this.link), '_blank')
    }
  }

  constructor(private router: Router) {}

  private getLink(link): any[] {
    if (!_.isArray(link)) {
      link = [link]
    }

    return link
  }

  private getUrl(link): string {
    let url = ''

    if (_.isArray(link)) {
      url = link[0]

      if (link[1]) {
        url += '?' + qs.stringify(link[1])
      }
    } else {
      url = link
    }

    return url
  }
}
