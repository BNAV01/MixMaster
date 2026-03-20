import { Injectable, signal } from '@angular/core';
import {
  CreatePlatformEmailTemplateRequestDto,
  DispatchPlatformEmailTemplateRequestDto,
  PlatformAdminApiClient,
  PlatformEmailDispatchDto,
  PlatformEmailTemplateDetailDto,
  PlatformEmailTemplateSummaryDto,
  PlatformEmailTestResultDto,
  PlatformMessagingWorkspaceDto,
  PlatformRenderedEmailPreviewDto,
  PreviewPlatformEmailTemplateRequestDto,
  SendPlatformTestEmailRequestDto,
  UpdatePlatformEmailSettingsRequestDto,
  UpdatePlatformEmailTemplateRequestDto
} from '@mixmaster/shared/api-clients';
import { AsyncStatus, NormalizedApiError } from '@mixmaster/shared/models';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformMessagingFacade {
  readonly workspace = signal<PlatformMessagingWorkspaceDto | null>(null);
  readonly templateDetail = signal<PlatformEmailTemplateDetailDto | null>(null);
  readonly preview = signal<PlatformRenderedEmailPreviewDto | null>(null);
  readonly lastDispatch = signal<PlatformEmailDispatchDto | null>(null);
  readonly lastTestResult = signal<PlatformEmailTestResultDto | null>(null);
  readonly workspaceStatus = signal<AsyncStatus>('idle');
  readonly templateDetailStatus = signal<AsyncStatus>('idle');
  readonly settingsSaveStatus = signal<AsyncStatus>('idle');
  readonly templateSaveStatus = signal<AsyncStatus>('idle');
  readonly previewStatus = signal<AsyncStatus>('idle');
  readonly dispatchStatus = signal<AsyncStatus>('idle');
  readonly testStatus = signal<AsyncStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly platformAdminApiClient: PlatformAdminApiClient) {}

  loadWorkspace(): void {
    this.workspaceStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.loadMessagingWorkspace().pipe(take(1)).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.workspaceStatus.set('success');
        const currentTemplateId = this.templateDetail()?.templateId;
        if (currentTemplateId && !workspace.templates.some((template) => template.templateId === currentTemplateId)) {
          this.templateDetail.set(null);
          this.preview.set(null);
        }
      },
      error: (error: NormalizedApiError) => {
        this.workspace.set(null);
        this.workspaceStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  loadTemplate(templateId: string): void {
    this.templateDetailStatus.set('loading');
    this.errorMessage.set(null);
    this.preview.set(null);

    this.platformAdminApiClient.getEmailTemplate(templateId).pipe(take(1)).subscribe({
      next: (templateDetail) => {
        this.templateDetail.set(templateDetail);
        this.templateDetailStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.templateDetail.set(null);
        this.templateDetailStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  clearTemplateSelection(): void {
    this.templateDetail.set(null);
    this.preview.set(null);
  }

  updateEmailSettings(payload: UpdatePlatformEmailSettingsRequestDto): void {
    this.settingsSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.updateEmailSettings(payload).pipe(take(1)).subscribe({
      next: (settings) => {
        this.workspace.update((workspace) => workspace
          ? { ...workspace, settings }
          : { settings, placeholders: [], templates: [] }
        );
        this.settingsSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.settingsSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  sendEmailSettingsTest(payload: SendPlatformTestEmailRequestDto): void {
    this.testStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.sendEmailSettingsTest(payload).pipe(take(1)).subscribe({
      next: (result) => {
        this.lastTestResult.set(result);
        this.workspace.update((workspace) => workspace
          ? {
              ...workspace,
              settings: {
                ...workspace.settings,
                lastTestSentAt: result.sentAt,
                lastTestStatus: result.status,
                lastTestError: null
              }
            }
          : workspace
        );
        this.testStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.testStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  createTemplate(payload: CreatePlatformEmailTemplateRequestDto): void {
    this.templateSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.createEmailTemplate(payload).pipe(take(1)).subscribe({
      next: (templateDetail) => {
        this.templateDetail.set(templateDetail);
        this.preview.set(null);
        this.syncTemplateSummary(templateDetail);
        this.templateSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.templateSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  updateTemplate(templateId: string, payload: UpdatePlatformEmailTemplateRequestDto): void {
    this.templateSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.updateEmailTemplate(templateId, payload).pipe(take(1)).subscribe({
      next: (templateDetail) => {
        this.templateDetail.set(templateDetail);
        this.preview.set(null);
        this.syncTemplateSummary(templateDetail);
        this.templateSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.templateSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  deleteTemplate(templateId: string): void {
    this.templateSaveStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.deleteEmailTemplate(templateId).pipe(take(1)).subscribe({
      next: () => {
        this.workspace.update((workspace) => workspace
          ? {
              ...workspace,
              templates: workspace.templates.filter((template) => template.templateId !== templateId)
            }
          : workspace
        );
        if (this.templateDetail()?.templateId === templateId) {
          this.templateDetail.set(null);
          this.preview.set(null);
        }
        this.templateSaveStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.templateSaveStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  previewTemplate(templateId: string, payload: PreviewPlatformEmailTemplateRequestDto): void {
    this.previewStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.previewEmailTemplate(templateId, payload).pipe(take(1)).subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.previewStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.preview.set(null);
        this.previewStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  dispatchTemplate(templateId: string, payload: DispatchPlatformEmailTemplateRequestDto): void {
    this.dispatchStatus.set('loading');
    this.errorMessage.set(null);

    this.platformAdminApiClient.dispatchEmailTemplate(templateId, payload).pipe(take(1)).subscribe({
      next: (dispatch) => {
        this.lastDispatch.set(dispatch);
        this.dispatchStatus.set('success');
      },
      error: (error: NormalizedApiError) => {
        this.dispatchStatus.set('error');
        this.errorMessage.set(error.message);
      }
    });
  }

  private syncTemplateSummary(detail: PlatformEmailTemplateDetailDto): void {
    const summary: PlatformEmailTemplateSummaryDto = {
      templateId: detail.templateId,
      code: detail.code,
      name: detail.name,
      category: detail.category,
      active: detail.active,
      updatedAt: detail.updatedAt
    };

    this.workspace.update((workspace) => {
      if (!workspace) {
        return workspace;
      }

      const exists = workspace.templates.some((template) => template.templateId === detail.templateId);
      const templates = exists
        ? workspace.templates.map((template) => template.templateId === detail.templateId ? summary : template)
        : [...workspace.templates, summary];

      return {
        ...workspace,
        templates: [...templates].sort((left, right) => left.name.localeCompare(right.name))
      };
    });
  }
}
