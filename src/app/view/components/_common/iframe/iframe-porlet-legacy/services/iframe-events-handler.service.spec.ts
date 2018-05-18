import { DotIframeEventsHandler } from './iframe-events-handler.service';
import { DOTTestBed } from '../../../../../../test/dot-test-bed';
import { DotLoadingIndicatorService } from '../../dot-loading-indicator/dot-loading-indicator.service';
import { DotRouterService } from '../../../../../../api/services/dot-router/dot-router.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DotMenuService } from '../../../../../../api/services/dot-menu.service';
import { DotContentletEditorService } from '../../../../dot-contentlet-editor/services/dot-contentlet-editor.service';

describe('DotIframeEventsHandler', () => {
    let service: DotIframeEventsHandler;
    let dotLoadingIndicatorService: DotLoadingIndicatorService;
    let dotRouterService: DotRouterService;
    let dotContentletEditorService: DotContentletEditorService;
    let injector;

    beforeEach(() => {
        injector = DOTTestBed.configureTestingModule({
            providers: [DotIframeEventsHandler, DotLoadingIndicatorService, DotMenuService],
            imports: [RouterTestingModule]
        });

        service = injector.get(DotIframeEventsHandler);
        dotLoadingIndicatorService = injector.get(DotLoadingIndicatorService);
        dotRouterService = injector.get(DotRouterService);
        dotContentletEditorService = injector.get(DotContentletEditorService);
    });

    it('should show loading indicator and go to edit page when event is emited by iframe', () => {
        spyOn(dotLoadingIndicatorService, 'show');
        spyOn(dotRouterService, 'goToEditPage');

        service.handle(
            new CustomEvent('ng-event', {
                detail: {
                    name: 'edit-page',
                    data: {
                        url: 'some/url'
                    }
                }
            })
        );

        expect(dotLoadingIndicatorService.show).toHaveBeenCalledTimes(1);
        expect(dotRouterService.goToEditPage).toHaveBeenCalledWith('some/url');
    });

    it('should create a contentlet', () => {
        spyOn(dotContentletEditorService, 'create');
        service.handle(
            new CustomEvent('ng-event', {
                detail: {
                    name: 'create-contentlet',
                    data: {
                        url: 'hello.world.com'
                    }
                }
            })
        );

        expect(dotContentletEditorService.create).toHaveBeenCalledWith({
            data: {
                url: 'hello.world.com'
            }
        });
    });

    it('should edit a contentlet', () => {
        spyOn(dotContentletEditorService, 'edit');
        service.handle(
            new CustomEvent('ng-event', {
                detail: {
                    name: 'edit-contentlet',
                    data: {
                        inode: '123'
                    }
                }
            })
        );


        expect(dotContentletEditorService.edit).toHaveBeenCalledWith({
            data: {
                inode: '123'
            }
        });
    });
});